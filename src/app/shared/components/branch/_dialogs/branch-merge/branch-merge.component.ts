import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { YesNoDialogModel } from '../../../../model/yesNoDialog.model';
import { Repository } from '../../../../state/DATA/repositories';
import { RepositoryBranchesService, RepositoryBranchSummary } from '../../../../state/DATA/branches';
import { RepositoryStatusService, RepositoryStatusState } from '../../../../state/DATA/repository-status';
import { ComputedAction } from '../../../../model/merge.interface';
import { fromPromise } from 'rxjs/internal-compatibility';

@Component({
  selector: 'gitme-branch-merge',
  templateUrl: './branch-merge.component.html',
  styleUrls: ['./branch-merge.component.scss']
})
export class BranchMergeComponent implements OnInit {

  branchStatus: RepositoryStatusState = null;
  repository: Repository = null;
  branchFrom: RepositoryBranchSummary = null;
  branchTarget: RepositoryBranchSummary = null;

  infoMerge: string = null;
  disableMerge = false;

  checkMergeStatus = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: YesNoDialogModel<{
      repository: Repository,
      branchTarget: RepositoryBranchSummary,
      branchFrom: RepositoryBranchSummary
    }>,
    public dialogRef: MatDialogRef<BranchMergeComponent>,
    private branchService: RepositoryBranchesService,
    private statusService: RepositoryStatusService,
  ) {
    dialogRef.disableClose = true;
    this.branchStatus = this.statusService.get();
    this.repository = this.data.data.repository;
    this.branchFrom = this.data.data.branchFrom;
    this.branchTarget = this.data.data.branchTarget;
  }

  ngOnInit() {
    this.branchService.getMergeStatus(this.repository, this.branchFrom, this.branchTarget).subscribe(
      res => {
        this.checkMergeStatus = false;
        if (res.kind === ComputedAction.Conflicts) {
          this.infoMerge = 'This merge will create conflicts, do you wish to continue?';
        } else if (res.kind === ComputedAction.Invalid) {
          this.infoMerge = 'This merge action is unavailable!';
          this.disableMerge = true;
        } else {
          this.infoMerge = 'Ok to proceed!';
        }
      }
    );
  }

  merge() {
    fromPromise(this.branchService.merge(this.repository, this.branchFrom))
    .subscribe(stat => {
      this.dialogRef.close(undefined);
    }, error => {
      console.log(error);
      this.dialogRef.close(undefined);
    });
  }

  abortMerge() {
    // this.branchService.abortMerge(this.repository);
    this.dialogRef.close(undefined);
  }
}
