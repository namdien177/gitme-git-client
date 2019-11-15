import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { YesNoDialogModel } from '../../../../model/yesNoDialog.model';
import { Repository } from '../../../../state/DATA/repositories';
import { RepositoryBranchesService, RepositoryBranchSummary } from '../../../../state/DATA/repository-branches';
import { RepositoryStatusService, RepositoryStatusState } from '../../../../state/DATA/repository-status';
import { GitService } from '../../../../../services/features/git.service';

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

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: YesNoDialogModel<{
      repository: Repository,
      branchTarget: RepositoryBranchSummary,
      branchFrom: RepositoryBranchSummary
    }>,
    public dialogRef: MatDialogRef<BranchMergeComponent>,
    private branchService: RepositoryBranchesService,
    private statusService: RepositoryStatusService,
    // debug
    private git: GitService
  ) {
    dialogRef.disableClose = true;
    this.branchStatus = this.statusService.get();
    this.repository = this.data.data.repository;
    this.branchFrom = this.data.data.branchFrom;
    this.branchTarget = this.data.data.branchTarget;
  }

  ngOnInit() {

  }

  trackBranchID(index: number, item: RepositoryBranchSummary) {
    return item.id;
  }

  testMerge(branch: RepositoryBranchSummary) {
    this.git.checkMergeStatus(this.repository, this.branchFrom, this.branchTarget)
    .then(stat => {
      console.log(stat);
    });
  }

  abortMerge() {
    this.branchService.abortMerge(this.repository);
    this.dialogRef.close(undefined);
  }
}
