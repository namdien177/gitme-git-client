import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { StatusSummary } from '../../../model/StatusSummary';
import { FileStatusSummaryView, RepositoryStatusService } from '../../../state/DATA/repository-status';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ArrayLengthShouldLargerThan } from '../../../validate/customFormValidate';

@Component({
    selector: 'gitme-commit-menu',
    templateUrl: './commit-menu.component.html',
    styleUrls: ['./commit-menu.component.scss']
})
export class CommitMenuComponent implements OnInit, OnDestroy {

    @Input()
    statusSummary: StatusSummary;

    @Input()
    isViewChangeTo: 'changes' | 'history' = 'changes';
    @Output()
    isViewChangeToChange: EventEmitter<'changes' | 'history'> = new EventEmitter<'changes' | 'history'>();

    formCommitment: FormGroup;

    checkboxAllFileStatus = false;
    customOptionCommit = false;

    private componentDestroyed: Subject<boolean> = new Subject<boolean>();

    constructor(
        private repositoryStatusService: RepositoryStatusService,
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
        );
        // Update the formData
        this.customOptionCommit = !this.customOptionCommit;
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

    private setupFormCommitment() {
        this.formCommitment = this.fb.group({
            title: ['', [Validators.required]],
            files: [[], [ArrayLengthShouldLargerThan(0)]],
            optional: ['', []]
        });
    }
}
