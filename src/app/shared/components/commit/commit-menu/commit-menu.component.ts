import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { StatusSummary } from '../../../model/statusSummary.model';
import { FileStatusSummaryView, RepositoryStatusService } from '../../../state/DATA/repository-status';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ArrayLengthShouldLargerThan } from '../../../validate/customFormValidate';
import { UtilityService } from '../../../utilities/utility.service';
import { RepositoriesService, Repository } from '../../../state/DATA/repositories';
import { MatDialog } from '@angular/material';
import { CommitOptionsComponent } from '../_dialogs/commit-options/commit-options.component';
import { RepositoryBranchSummary } from '../../../state/DATA/repository-branches';
import { defaultCommitOptionDialog } from '../../../model/yesNoDialog.model';

@Component({
    selector: 'gitme-commit-menu',
    templateUrl: './commit-menu.component.html',
    styleUrls: ['./commit-menu.component.scss']
})
export class CommitMenuComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input()
    statusSummary: StatusSummary;
    @Input()
    activeBranch: RepositoryBranchSummary;
    @Input()
    isViewChangeTo: 'changes' | 'history' = 'changes';
    @Output()
    isViewChangeToChange: EventEmitter<'changes' | 'history'> = new EventEmitter<'changes' | 'history'>();
    formCommitment: FormGroup;
    checkboxAllFileStatus = false;
    customOptionCommit = false;
    customOptionCommitInput = '';
    private componentDestroyed: Subject<boolean> = new Subject<boolean>();

    constructor(
        private repositoryStatusService: RepositoryStatusService,
        private repositoriesService: RepositoriesService,
        private utilitiesService: UtilityService,
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
        if (this.customOptionCommit) {
            // having custom option when commit
        }

        console.log(this.title.value);
        console.log(this.files.value);
        console.log(this.optional.value);
        return;
        this.repositoriesService.commit(activeRepository, this.title.value, paths).subscribe(
            result => {
                console.log(result);
                this.formCommitment.reset();
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
            console.log(res);
            this.optional.setValue(res);
        });
    }

    private setupFormCommitment() {
        this.formCommitment = this.fb.group({
            title: ['', [Validators.required]],
            files: [[], [ArrayLengthShouldLargerThan(0)]],
            optional: [null, []]
        });
    }
}
