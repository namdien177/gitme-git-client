import { Component, OnDestroy, OnInit } from '@angular/core';
import { RepositoriesMenuQuery, RepositoriesMenuService } from '../../states/UI/repositories-menu';
import { RepositoriesQuery, RepositoriesService, Repository } from '../../states/DATA/repositories';
import { RepositoryBranchesQuery, RepositoryBranchesService, RepositoryBranchSummary } from '../../states/DATA/repository-branches';
import { GitService } from '../../../services/features/git.service';
import { AccountListService } from '../../states/DATA/account-list';
import { switchMap, takeUntil } from 'rxjs/operators';
import { StatusSummary } from '../../model/StatusSummary';
import { interval, of, Subject } from 'rxjs';
import { UtilityService } from '../../utilities/utility.service';

@Component({
    selector: 'gitme-navigation-bar',
    templateUrl: './navigation-bar.component.html',
    styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent implements OnInit, OnDestroy {
    isRepositoryBoxOpen = false;
    isBranchBoxOpen = false;
    activeRepository: Repository = null;
    activeBranch: RepositoryBranchSummary = null;
    statusSummary: StatusSummary;

    private componentDestroyed: Subject<boolean> = new Subject<boolean>();

    constructor(
        private repositoriesMenuQuery: RepositoriesMenuQuery,
        private repositoriesMenuService: RepositoriesMenuService,
        protected repositoriesQuery: RepositoriesQuery,
        protected branchesQuery: RepositoryBranchesQuery,
        private repositoriesService: RepositoriesService,
        private branchesService: RepositoryBranchesService,
        private accountService: AccountListService,
        private gitService: GitService,
        protected utilities: UtilityService
    ) {
        // State UI
        this.repositoriesMenuQuery.select().subscribe(state => {
            this.isRepositoryBoxOpen = state.is_repository_open && !!state.is_available;
            this.isBranchBoxOpen = state.is_branch_open && !!state.is_available;
        });

        // Retrieve current selected repository
        this.repositoriesService.getActive()
        .subscribe(
            selectedRepo => {
                this.activeRepository = selectedRepo;
                this.branchesService.load(selectedRepo, null);
            }
        );

        this.branchesQuery.selectAll()
        .subscribe(
            listBranch => {
                this.activeBranch = listBranch.find(branch => {
                    return branch.current || branch.current === 'true';
                });
                console.log(listBranch);
            }
        );

        // start listening to changes by GIT
        interval(2000).pipe(
            takeUntil(this.componentDestroyed),
            switchMap(
                () => {
                    if (!!this.activeRepository) {
                        return this.repositoriesService.getBranchStatus(
                            this.activeRepository,
                            false
                        );
                    }
                    return of(null);
                }
            )
        ).subscribe((status) => {
            this.statusSummary = status;
            console.log(status);
        });

    }

    ngOnDestroy(): void {
        this.componentDestroyed.next(true);
    }

    ngOnInit() {

    }

    toggleRepositoryBox() {
        if (this.isRepositoryBoxOpen) {
            this.repositoriesMenuService.closeRepoMenu();
        } else {
            this.repositoriesMenuService.openRepoMenu();
        }
    }

    toggleBranchBox() {
        if (this.isBranchBoxOpen) {
            this.repositoriesMenuService.closeBranchMenu();
        } else {
            this.repositoriesMenuService.openBranchMenu();
        }
    }

    clickOutSide(isOutSide: boolean, button: 'repositories' | 'branches') {
        if (isOutSide) {
            switch (button) {
                case 'branches':
                    if (this.isBranchBoxOpen) {
                        this.repositoriesMenuService.closeBranchMenu();
                    }
                    break;
                case 'repositories':
                    if (this.isRepositoryBoxOpen) {
                        this.repositoriesMenuService.closeRepoMenu();
                    }
                    break;
            }
        }
    }
}
