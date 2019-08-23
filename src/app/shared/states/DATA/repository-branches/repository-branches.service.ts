import { Injectable } from '@angular/core';
import { RepositoryBranchesStore } from './repository-branches.store';
import { RepositoryBranchSummary } from './repository-branch.model';
import { RepositoryBranchesQuery } from './repository-branches.query';
import { GitService } from '../../../../services/features/git.service';
import { Account } from '../account-list';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RepositoryBranchesService {

    constructor(
        private store: RepositoryBranchesStore,
        private query: RepositoryBranchesQuery,
        private gitService: GitService
    ) {
    }

    async load(directoryGIT: string, credentials?: Account) {
        const repoSum = await this.gitService.allBranches(directoryGIT, credentials);
        this.set(repoSum);
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
        console.log(listBranch);
        this.store.set(listBranch);
    }

    get(): Observable<RepositoryBranchSummary[]> {
        return this.query.selectAll();
    }

    setLoading() {
        this.store.setLoading(true);
    }

    finishLoading() {
        this.store.setLoading(false);
    }
}
