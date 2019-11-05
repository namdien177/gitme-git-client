import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { YesNoDialogModel } from '../../../../../model/yesNoDialog.model';
import { Repository } from '../../../../../state/DATA/repositories';
import { FileStatusSummaryView, RepositoryStatusService } from '../../../../../state/DATA/repository-status';
import { RepositoryBranchSummary } from '../../../../../state/DATA/repository-branches';
import { shouldNotExistInArray } from '../../../../../validate/customFormValidate';
import { SecurityService } from '../../../../../../services/system/security.service';

@Component({
    selector: 'gitme-branch-new-option',
    templateUrl: './branch-new-option.component.html',
    styleUrls: ['./branch-new-option.component.scss']
})
export class BranchNewOptionComponent implements OnInit {

    repository: Repository;
    branch: RepositoryBranchSummary;
    currentChanges: FileStatusSummaryView[];

    formBuilder: FormGroup;

    constructor(
        public dialogRef: MatDialogRef<BranchNewOptionComponent>,
        private repositoryStatusService: RepositoryStatusService,
        private securityService: SecurityService,
        private fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public emittedDataFromView: YesNoDialogModel
    ) {
        this.repository = emittedDataFromView.data['repository'];
        this.branch = emittedDataFromView.data['branch'];
        repositoryStatusService.select().subscribe(
            statusChanges => this.currentChanges = statusChanges.files
        );
    }

    get branchName() {
        return this.formBuilder.get('branchName');
    }

    get fromBranch() {
        return this.formBuilder.get('fromBranch');
    }

    ngOnInit() {
        this.formBuilder = this.fb.group({
            branchName: ['', [
                Validators.required,
                Validators.minLength(1),
                shouldNotExistInArray(['123'], 'existing branches')
            ]],
            fromBranch: [0, [Validators.required]]
        });
    }

    cancel() {
        this.dialogRef.close(null);
    }

    checkoutFrom() {
        this.dialogRef.close({
            name: this.branchName.value,
            fromBranch: <boolean>this.fromBranch.value ? this.branch.name : null
        });
    }
}
