import { Component, OnDestroy, OnInit } from '@angular/core';
import { RepositoriesMenuService } from '../../states/UI/repositories-menu';
import { RepositoriesQuery, RepositoriesService, Repository } from '../../states/DATA/repositories';
import { RepositoryBranchesQuery, RepositoryBranchesService, RepositoryBranchSummary } from '../../states/DATA/repository-branches';
import { AccountListService } from '../../states/DATA/account-list';
import { auditTime, debounceTime, switchMap, takeUntil, takeWhile } from 'rxjs/operators';
import { StatusSummary } from '../../model/StatusSummary';
import { interval, of, Subject } from 'rxjs';
import { UtilityService } from '../../utilities/utility.service';
import { FileWatchesQuery, FileWatchesService } from '../../states/system/File-Watches';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileStatusSummaryView, RepositoryStatusService } from '../../states/DATA/repository-status';
import { ArrayLengthShouldLargerThan } from '../../validate/customFormValidate';
import { ApplicationStateService } from '../../states/UI/Application-State';
import { fromPromise } from 'rxjs/internal-compatibility';

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

    checkboxAllFileStatus = false;
    formCommitment: FormGroup;

    loading = {
        commit: false,
        fetch: false,
        push: false,
        branch: false,
        repository: false,
    };

    private componentDestroyed: Subject<boolean> = new Subject<boolean>();

    constructor(
        private repositoriesMenuService: RepositoriesMenuService,
        public repositoriesQuery: RepositoriesQuery,
        public branchesQuery: RepositoryBranchesQuery,
        private repositoriesService: RepositoriesService,
        private repositoryBranchesService: RepositoryBranchesService,
        private accountService: AccountListService,
        private fileWatchesService: FileWatchesService,
        private fileWatchesQuery: FileWatchesQuery,
        private repositoryStatusService: RepositoryStatusService,
        public utilities: UtilityService,
        private fb: FormBuilder,
        private applicationStateService: ApplicationStateService
    ) {
        this.watchingUIState();
        this.watchingRepository();
        this.watchingBranch();
        this.watchingFileChanges(); // Chokidar is more efficient!
        this.loopRefreshBranchStatus();

        this.watchLoading();
    }

    get titleCommit() {
        return this.formCommitment.get('title');
    }

    get filesCommit() {
        return this.formCommitment.get('files');
    }

    ngOnDestroy(): void {
        this.componentDestroyed.next(true);
    }

    ngOnInit() {
        this.setupFormCommitment();
    }

    toggleRepositoryBox() {
        this.repositoriesMenuService.toggleRepositoryMenu(this.isRepositoryBoxOpen);
    }

    toggleBranchBox() {
        this.repositoriesMenuService.toggleBranchMenu(this.isBranchBoxOpen);
    }

    eventEmitCheckBoxFile(event: boolean) {
        this.checkboxAllFileStatus = event;
    }

    toggleCheckboxAllFile() {
        if (this.checkboxAllFileStatus) {
            this.repositoryStatusService.uncheckAllCheckboxState();
        } else {
            this.repositoryStatusService.checkAllCheckboxState();
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

    setNewFilesCommit(files: FileStatusSummaryView[]) {
        const newFileList: FileStatusSummaryView[] = [];
        files.forEach(
            file => {
                if (file.checked) {
                    newFileList.push(file);
                }
            }
        );

        // Update the formData
        this.filesCommit.setValue(newFileList);
    }

    commitFile() {
        if (this.formCommitment.invalid) {
            return;
        }
        this.loading.commit = true;
        const listFilesCommit: FileStatusSummaryView[] = this.filesCommit.value;
        const paths: string[] = this.utilities.extractFilePathFromGitStatus(listFilesCommit);
        this.repositoriesService.commit(this.repository, this.titleCommit.value, paths).subscribe(
            result => {
                this.loading.commit = false;
                this.formCommitment.reset();
                console.log(result);
            }
        );
    }

    pushCommit() {
        if (this.statusSummary.ahead < 1) {
            return;
        }
        this.loading.push = true;
        const branches = this.repositoryBranchesService.getSync();
        this.repositoriesService.push(this.repository, branches).subscribe(
            result => {
                this.loading.commit = false;
                console.log(result);
            }
        );
    }

    fetch() {
        this.loading.fetch = true;
        this.repositoriesService.getRemotes(this.repository).subscribe(
            result => {
                this.loading.fetch = false;
                console.log(result);
            }
        );
    }

    private watchingUIState() {
        this.repositoriesMenuService.select().subscribe(state => {
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
            switchMap(selectedRepo => {
                this.loading.branch = true;
                this.loading.repository = true;
                this.repository = selectedRepo;
                let account = null;
                if (this.repository) {
                    const dir = this.repository.directory;
                    this.fileWatchesService.switchTo(dir);
                    account = this.accountService.getOneSync(this.repository.credential.id_credential);
                }
                return fromPromise(this.repositoryBranchesService.load(selectedRepo, account));
            }),
            switchMap(() => this.observingBranchStatus())
        )
        .subscribe(
            (status: StatusSummary) => {
                console.log(status);
                this.statusSummary = status;
                if (status) {
                    this.repositoryStatusService.set(status);
                }
                this.loading.branch = false;
                this.loading.repository = false;
            }
        );
    }

    private watchingBranch() {
        this.branchesQuery.selectAll()
        .subscribe(
            listBranch => {
                this.activeBranch = listBranch.find(branch => {
                    return branch.current;
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
            takeWhile(
                () => !this.applicationStateService.getApplicationState().isLosingFocus
            ),
            switchMap(() => this.observingBranchStatus())
        ).subscribe(
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

    /**
     * Default looping 15s
     * @param loopDuration
     */
    private loopRefreshBranchStatus(loopDuration = 15000) {
        interval(loopDuration)
        .pipe(
            takeUntil(this.componentDestroyed),
            switchMap(() => this.observingBranchStatus())
        ).subscribe((status) => {
            this.statusSummary = status;
            if (status) {
                this.repositoryStatusService.set(status);
            }
        });
    }

    private setupFormCommitment() {
        this.formCommitment = this.fb.group({
            title: ['', [Validators.required]],
            files: [[], [ArrayLengthShouldLargerThan(0)]]
        });
    }

    private watchLoading() {
        this.branchesQuery.selectLoading()
        .pipe(
            auditTime(200)
        )
        .subscribe(status => this.loading.branch = status);

        this.repositoriesQuery.selectLoading()
        .pipe(
            auditTime(200)
        )
        .subscribe(status => this.loading.repository = status);
    }
}
