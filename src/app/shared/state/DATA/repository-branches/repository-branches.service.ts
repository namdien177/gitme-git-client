import { Injectable } from '@angular/core';
import { RepositoryBranchesStore } from './repository-branches.store';
import { RepositoryBranchSummary } from './repository-branch.model';
import { RepositoryBranchesQuery } from './repository-branches.query';
import { GitService } from '../../../../services/features/git.service';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Repository } from '../repositories';
import { fromPromise } from 'rxjs/internal-compatibility';
import { FileStatusSummaryView } from '../repository-status';

@Injectable({ providedIn: 'root' })
export class RepositoryBranchesService {

    constructor(
        private store: RepositoryBranchesStore,
        private query: RepositoryBranchesQuery,
        private gitService: GitService
    ) {
    }

    /**
     * STATUS: DONE
     * Load branches information of a repository.
     * @param repository
     */
    async load(repository: Repository) {
        const repoSum = await this.gitService.getBranchInfo(repository.directory, repository.branches);
        this.set(repoSum);
    }

    /**
     * STATUS: DONE
     * Checkout other branch.
     * @param repo
     * @param branch
     */
    checkoutBranch(repo: Repository, branch: RepositoryBranchSummary) {
        this.setLoading();
        return fromPromise(this.gitService.switchBranch(repo, branch))
        .pipe(
            map(status => {
                this.finishLoading();
                return status;
            })
        );
    }

    /**
     * STATUS: DONE
     * @param repository
     * @param files
     */
    revertFiles(repository: Repository, files: FileStatusSummaryView[]) {
        const dirList = files.map(file => file.path);
        return fromPromise(this.gitService.revert(repository, dirList));
    }

    ignoreFile(repository: Repository, file: FileStatusSummaryView) {
        const dir = file.path;
        return fromPromise(this.gitService.addToIgnore(repository, dir));
    }

    /**
     *
     * @param repository
     * @param branchName
     * @param fromBranch
     */
    newBranchFrom(repository: Repository, branchName: string, fromBranch: RepositoryBranchSummary = null) {
        let fromBranchName = '';
        if (fromBranch) {
            fromBranchName = fromBranch.name;
            return fromPromise(
                this.gitService.gitInstance(repository.directory)
                .checkoutBranch(branchName, fromBranchName)
            );
        }
        return fromPromise(
            this.gitService.gitInstance(repository.directory)
            .checkoutLocalBranch(branchName)
        );
    }

    set(listBranch: RepositoryBranchSummary[]) {
        listBranch.sort(
            (branchA, branchB) => {
                if (branchA.current) {
                    return -1;
                } else if (branchB.current) {
                    return 1;
                }
                return 0;
            }
        );
        listBranch.every(branch => {
            if (branch.current) {
                this.setActive(branch);
                return false;
            }
            return true;
        });
        this.store.set(listBranch);
    }

    select(): Observable<RepositoryBranchSummary[]> {
        return this.query.selectAll();
    }

    get(): RepositoryBranchSummary[] {
        return this.query.getAll();
    }

    selectActive() {
        this.setLoading();
        return this.query.selectActive().pipe(
            tap(() => {
                this.finishLoading();
            })
        );
    }

    getActive() {
        return this.query.getActive();
    }

    setActive(branch: RepositoryBranchSummary) {
        this.store.setActive(branch.id);
    }

    setActiveID(branchID: string) {
        this.store.setActive(branchID);
    }

    setLoading() {
        this.store.setLoading(true);
    }

    finishLoading() {
        this.store.setLoading(false);
    }
}
