import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { StatusSummary } from '../../../model/statusSummary.model';
import { createInitialState, FileStatusSummaryView, RepositoryStatusService } from '../../../state/DATA/repository-status';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ArrayLengthShouldLargerThan } from '../../../validate/customFormValidate';
import { UtilityService } from '../../../utilities/utility.service';
import { RepositoriesService, Repository } from '../../../state/DATA/repositories';
import { MatDialog } from '@angular/material';
import { CommitOptionsComponent } from '../_dialogs/commit-options/commit-options.component';
import { CommitOptions, RepositoryBranchesService, RepositoryBranchSummary } from '../../../state/DATA/repository-branches';
import { defaultCommitOptionDialog } from '../../../model/yesNoDialog.model';
import { switchMap } from 'rxjs/operators';
import { GitDiffService } from '../../../state/DATA/git-diff';

@Component({
    selector: 'gitme-commit-menu',
    templateUrl: './commit-menu.component.html',
    styleUrls: ['./commit-menu.component.scss']
})
export class CommitMenuComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input()
    isViewChangeTo: 'changes' | 'history' = 'changes';
    @Output()
    isViewChangeToChange: EventEmitter<'changes' | 'history'> = new EventEmitter<'changes' | 'history'>();

    repository: Repository = null;
    statusSummary: StatusSummary = createInitialState();
    activeBranch: RepositoryBranchSummary = null;

    formCommitment: FormGroup;
    checkboxAllFileStatus = false;
    customOptionCommit = false;

    private componentDestroyed: Subject<boolean> = new Subject<boolean>();

    constructor(
        private repositoryStatusService: RepositoryStatusService,
        private repositoryBranchesService: RepositoryBranchesService,
        private repositoriesService: RepositoriesService,
        private utilitiesService: UtilityService,
        private gitDiffService: GitDiffService,
        public dialog: MatDialog,
        private fb: FormBuilder
    ) {
    }

    get title() {
        return this.formCommitment.get('title');
    }

    get optional() {
        return this.formCommitment.get('optional');
    }

    get files() {
        return this.formCommitment.get('files');
    }

    ngAfterViewInit(): void {
    }

    ngOnInit() {
        this.setupFormCommitment();
        this.watchingRepository();
        this.watchingBranch();
        this.watchingSummary();
    }

    ngOnDestroy(): void {
        this.componentDestroyed.next(true);
    }

    eventEmitCheckBoxFile(event: boolean) {
        this.checkboxAllFileStatus = event;
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
        this.files.setValue(newFileList);
    }

    toggleOptionCommit() {
        this.customOptionCommit = !this.customOptionCommit;
        if (this.customOptionCommit) {
            this.optional.setValue(this.activeBranch.options);
        } else {
            this.optional.setValue(null);
        }
    }

    switchView(toView: string) {
        switch (toView) {
            case 'changes':
            case 'history':
                this.isViewChangeTo = toView;
                break;
            default:
                this.isViewChangeTo = 'changes';
        }
    }

    toggleCheckboxAllFile() {
        if (this.checkboxAllFileStatus) {
            this.repositoryStatusService.uncheckAllCheckboxState();
        } else {
            this.repositoryStatusService.checkAllCheckboxState();
        }
    }

    commitSelected() {
        if (this.formCommitment.invalid) {
            return;
        }

        const listFilesCommit: FileStatusSummaryView[] = this.files.value;
        const paths: string[] = this.utilitiesService.extractFilePathFromGitStatus(listFilesCommit);
        const activeRepository: Repository = this.repositoriesService.getActive();
        let optionCommits = null;
        if (this.customOptionCommit) {
            // having custom option when commit
            optionCommits = this.optional.value;
        }

        this.repositoriesService.commit(activeRepository, this.title.value, paths, optionCommits)
        .pipe(
            switchMap(result => {
                this.formCommitment.reset();
                console.log(this.repository);
                this.gitDiffService.reset();
                return this.repositoriesService.fetch(
                    { ...this.repository } as Repository,
                    this.activeBranch
                );
            })
        )
        .subscribe(
            fetchStatus => {
                console.log(fetchStatus);
            }
        );
    }

    openCommitOptions() {
        const defaultDataCommit = defaultCommitOptionDialog;
        defaultDataCommit.data = this.activeBranch.options;
        const commitOptionResult = this.dialog.open(
            CommitOptionsComponent, {
                width: '550px',
                height: '400px',
                data: defaultDataCommit,
                panelClass: 'bg-primary-black-mat-dialog',
            }
        );

        commitOptionResult.afterClosed().subscribe(res => {
            let valPassed = null;
            if (Array.isArray(res)) {
                // save the array
                valPassed = this.parseSingleOptionCmd(res);
                this.activeBranch.options = res;
            }
            this.optional.setValue(valPassed);
        });
    }

    parseSingleOptionCmd(arrOptions: CommitOptions[]) {
        const finalOption = {};
        arrOptions.forEach(opt => {
            if (!!opt.argument && opt.argument.length > 0) {
                finalOption[opt.argument] = opt.value.length > 0 ? opt.value : null;
            } else {
                if (!!opt.value && opt.value.length > 0) {
                    // make this as properties
                    finalOption[opt.value] = null;
                }
            }
        });
        return finalOption;
    }

    private setupFormCommitment() {
        this.formCommitment = this.fb.group({
            title: ['', [Validators.required]],
            files: [[], [ArrayLengthShouldLargerThan(0)]],
            optional: [null, []]
        });
    }

    private watchingRepository() {
        this.repositoriesService.selectActive(false).subscribe(repoActive => {
            this.repository = repoActive;
        });
    }

    private watchingSummary() {
        this.repositoryStatusService.select().subscribe(status => {
            this.statusSummary = status;
        });
    }

    private watchingBranch() {
        this.repositoryBranchesService.select()
        .subscribe(
            listBranch => {
                this.activeBranch = listBranch.find(branch => {
                    return branch.current;
                });

                if (this.activeBranch) {
                    this.optional.setValue(this.activeBranch.options);
                }

                console.log(this.activeBranch);
            }
        );
    }
}
