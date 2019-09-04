import { Component, OnDestroy, OnInit } from '@angular/core';
import { RepositoriesMenuQuery, RepositoriesMenuService } from '../../states/UI/repositories-menu';
import { RepositoriesQuery, RepositoriesService, Repository } from '../../states/DATA/repositories';
import { RepositoryBranchesQuery, RepositoryBranchesService, RepositoryBranchSummary } from '../../states/DATA/repository-branches';
import { AccountListService } from '../../states/DATA/account-list';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';
import { StatusSummary } from '../../model/StatusSummary';
import { interval, of, Subject } from 'rxjs';
import { UtilityService } from '../../utilities/utility.service';
import { FileWatchesQuery, FileWatchesService } from '../../states/system/File-Watches';
import { FormBuilder } from '@angular/forms';
import { FileChangesService } from '../../states/system/File-Changes';

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
        private fileWatchesService: FileWatchesService,
        private fileWatchesQuery: FileWatchesQuery,
        private fileChangesService: FileChangesService,
        protected utilities: UtilityService,
        private fb: FormBuilder
    ) {
        this.watchingUIState();
        this.watchingRepository();
        this.watchingBranch();
        // this.watchingFileChanges(); // Chokidar is more efficient!
        this.loopRefreshBranchStatus();
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

    actionButtonClick() {

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

    private watchingUIState() {
        this.repositoriesMenuQuery.select().subscribe(state => {
            this.isRepositoryBoxOpen = state.is_repository_open && !!state.is_available;
            this.isBranchBoxOpen = state.is_branch_open && !!state.is_available;
        });
    }

    /**
     * Retrieve current selected repository
     */
    private watchingRepository() {
        this.repositoriesService.getActive()
        .pipe(
            switchMap(selectedRepo => {
                this.repository = selectedRepo;
                this.branchesService.load(selectedRepo, null);
                if (this.repository) {
                    const dir = this.repository.directory;
                    this.fileWatchesService.switchTo(dir);
                }

                return this.observingBranchStatus();
            })
        )
        .subscribe(
            (status: StatusSummary) => {
                console.log(status);
                this.statusSummary = status;
            }
        );
    }

    private watchingBranch() {
        this.branchesQuery.selectAll()
        .subscribe(
            listBranch => {
                this.activeBranch = listBranch.find(branch => {
                    return branch.current || branch.current === 'true';
                });
                console.log(listBranch);
            }
        );
    }

    /**
     * Start listening to changes by Chokidar for better performance and cross-platform support
     */
    private watchingFileChanges() {
        this.fileWatchesQuery.select().pipe(
            takeUntil(this.componentDestroyed),
            debounceTime(200),
            switchMap(
                () => {
                    return this.observingBranchStatus();
                }
            )
        ).subscribe(
            (status: StatusSummary) => {
                this.statusSummary = status;
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

    private loopRefreshBranchStatus(loopDuration = 2000) {
        interval(loopDuration)
        .pipe(
            takeUntil(this.componentDestroyed),
            switchMap(() => this.observingBranchStatus())
        )
        .subscribe((status) => {
            this.statusSummary = status;
        });
    }
}
