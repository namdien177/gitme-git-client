import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormBuilder } from '@angular/forms';
import { YesNoDialogModel } from '../../../../../model/yesNoDialog.model';
import { Repository } from '../../../../../state/DATA/repositories';
import { FileStatusSummaryView, RepositoryStatusService } from '../../../../../state/DATA/repository-status';
import { RepositoryBranchSummary } from '../../../../../state/DATA/repository-branches';

@Component({
    selector: 'gitme-branch-new-option',
    templateUrl: './branch-new-option.component.html',
    styleUrls: ['./branch-new-option.component.scss']
})
export class BranchNewOptionComponent implements OnInit {

    repository: Repository;
    branch: RepositoryBranchSummary;
    currentChanges: FileStatusSummaryView[];

    constructor(
        public dialogRef: MatDialogRef<BranchNewOptionComponent>,
        private repositoryStatusService: RepositoryStatusService,
        private fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public emittedDataFromView: YesNoDialogModel
    ) {
        this.repository = emittedDataFromView.data['repository'];
        this.branch = emittedDataFromView.data['branch'];
        repositoryStatusService.select().subscribe(
            statusChanges => this.currentChanges = statusChanges.files
        );
    }

    ngOnInit() {
    }

    cancel() {
        this.dialogRef.close(null);
    }
}
