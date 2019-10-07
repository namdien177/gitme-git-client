import { Component, OnDestroy, OnInit } from '@angular/core';
import { of, Subject } from 'rxjs';
import { RepositoriesMenuService } from '../../shared/state/UI/repositories-menu';
import { switchMap } from 'rxjs/operators';
import { RepositoriesService, Repository } from '../../shared/state/DATA/repositories';
import { fromPromise } from 'rxjs/internal-compatibility';
import { StatusSummary } from '../../shared/model/StatusSummary';
import { FileWatchesService } from '../../shared/state/system/File-Watches';
import { RepositoryBranchesService, RepositoryBranchSummary } from '../../shared/state/DATA/repository-branches';
import { RepositoryStatusService } from '../../shared/state/DATA/repository-status';

@Component({
    selector: 'gitme-repositories',
    templateUrl: './repositories.component.html',
    styleUrls: ['./repositories.component.scss']
})
export class RepositoriesComponent implements OnInit, OnDestroy {

    repository: Repository = null;                  // Repository instance
    statusSummary: StatusSummary;                   // Statistics of changes (file changed, push/pull/commit status)
    branches: RepositoryBranchSummary[] = [];
    activeBranch: RepositoryBranchSummary = null;   // Display current branch

    isRepositoryBoxOpen = false;
    isBranchBoxOpen = false;
    isViewChangeTo = 'changes';

    private componentDestroyed: Subject<boolean> = new Subject<boolean>();

    constructor(
        private repoMenuService: RepositoriesMenuService,
        private repositoriesService: RepositoriesService,
        private repositoryBranchesService: RepositoryBranchesService,
        private repositoryStatusService: RepositoryStatusService,
        private fileWatchesService: FileWatchesService,
    ) {
        this.watchingUIState();     // Observing dropdown list of components
        this.watchingRepository();  // Observing repository
        this.watchingBranch();  // Observing repository
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.componentDestroyed.next(true);
    }

    toggleRepositoryBox() {
        console.log('togg');
        this.repoMenuService.toggleRepositoryMenu(this.isRepositoryBoxOpen);
    }

    toggleBranchBox() {
        this.repoMenuService.toggleBranchMenu(this.isBranchBoxOpen);
    }

    clickOutSide(isOutSide: boolean, button: 'repositories' | 'branches') {
        if (isOutSide) {
            switch (button) {
                case 'branches':
                    if (this.isBranchBoxOpen) {
                        this.repoMenuService.closeBranchMenu();
                    }
                    break;
                case 'repositories':
                    if (this.isRepositoryBoxOpen) {
                        this.repoMenuService.closeRepoMenu();
                    }
                    break;
            }
        }
    }


    private watchingUIState() {
        this.repoMenuService.select().subscribe(state => {
            this.isRepositoryBoxOpen = state.is_repository_open && !!state.is_available;
            this.isBranchBoxOpen = state.is_branch_open && !!state.is_available;
        });
    }

    /**
     * Retrieve current selected repository
     */
    private watchingRepository() {
        this.repositoriesService.selectActive()
        .pipe(
            switchMap((selectedRepo: Repository) => {
                this.repository = selectedRepo;
                if (!!this.repository) {
                    const dir = this.repository.directory;
                    this.fileWatchesService.switchTo(dir);
                }
                return fromPromise(this.repositoryBranchesService.load(selectedRepo));
            }),
            switchMap(() => this.observingBranchStatus())
        )
        .subscribe(
            (status: StatusSummary) => {
                this.statusSummary = status;
                if (status) {
                    this.repositoryStatusService.set(status);
                }
            }
        );
    }

    /**
     * Return the current status of branch
     */
    private observingBranchStatus() {
        if (!!this.repository) {
            return this.repositoriesService.getBranchStatus(
                this.repository,
                false
            );
        }
        return of(null);
    }

    private watchingBranch() {
        this.repositoryBranchesService.get()
        .subscribe(
            listBranch => {
                this.branches = listBranch;
                this.activeBranch = listBranch.find(branch => {
                    return branch.current;
                });
            }
        );
    }
}
