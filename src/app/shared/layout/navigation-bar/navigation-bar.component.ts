import { Component, OnDestroy, OnInit } from '@angular/core';
import { RepositoriesMenuQuery, RepositoriesMenuService } from '../../states/UI/repositories-menu';
import { RepositoriesQuery, RepositoriesService, Repository } from '../../states/DATA/repositories';
import { RepositoryBranchesQuery, RepositoryBranchesService, RepositoryBranchSummary } from '../../states/DATA/repository-branches';
import { AccountListService } from '../../states/DATA/account-list';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';
import { StatusSummary } from '../../model/StatusSummary';
import { of, Subject } from 'rxjs';
import { UtilityService } from '../../utilities/utility.service';
import { FileChangesQuery, FileChangesService } from '../../states/system/FileChanges';

@Component({
    selector: 'gitme-navigation-bar',
    templateUrl: './navigation-bar.component.html',
    styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent implements OnInit, OnDestroy {
    isRepositoryBoxOpen = false;
    isBranchBoxOpen = false;
    repository: Repository = null;
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
        private fileChangesService: FileChangesService,
        private fileChangesQuery: FileChangesQuery,
        protected utilities: UtilityService
    ) {
        // State UI
        this.repositoriesMenuQuery.select().subscribe(state => {
            this.isRepositoryBoxOpen = state.is_repository_open && !!state.is_available;
            this.isBranchBoxOpen = state.is_branch_open && !!state.is_available;
        });

        // Retrieve current selected repository
        this.repositoriesService.getActive()
        .pipe(
            switchMap(selectedRepo => {
                this.repository = selectedRepo;
                this.branchesService.load(selectedRepo, null);
                if (this.repository) {
                    const dir = this.repository.directory;
                    this.fileChangesService.switchTo(dir);
                }

                if (!!this.repository) {
                    return this.repositoriesService.getBranchStatus(
                        this.repository,
                        false
                    );
                }
                return of(null);
            })
        )
        .subscribe(
            (status: StatusSummary) => {
                this.statusSummary = status;
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

        // start listening to changes by chokidar
        this.fileChangesQuery.select().pipe(
            takeUntil(this.componentDestroyed),
            debounceTime(200),
            switchMap(
                (changes) => {
                    console.log(changes);
                    if (!!this.repository) {
                        return this.repositoriesService.getBranchStatus(
                            this.repository,
                            false
                        );
                    }
                    return of(null);
                }
            )
        ).subscribe(
            (status: StatusSummary) => {
                this.statusSummary = status;
            }
        );
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
