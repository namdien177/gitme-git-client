import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef, MatDialog } from '@angular/material';
import { RepositoryBranchesService, RepositoryBranchSummary } from '../../../../state/DATA/repository-branches';
import { StatusSummary } from '../../../../model/statusSummary.model';
import { Repository } from '../../../../state/DATA/repositories';
import { YesNoDecisionComponent } from '../../../UI/dialogs/yes-no-decision/yes-no-decision.component';
import { YesNoDialogModel } from '../../../../model/yesNoDialog.model';

@Component({
  selector: 'gitme-branch-options',
  templateUrl: './branch-options.component.html',
  styleUrls: ['./branch-options.component.scss']
})
export class BranchOptionsComponent implements OnInit {

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<BranchOptionsComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: {
      branch: RepositoryBranchSummary
      status: StatusSummary,
      repository: Repository
    },
    private matDialog: MatDialog,
    private repositoryBranchService: RepositoryBranchesService
  ) {
  }

  ngOnInit() {
  }

  renameBranch() {

  }

  deleteBranch() {
    if (this.data.status.ahead > 0) {
      // warn about the delete
      const data: YesNoDialogModel = {
        title: 'Delete branch',
        body: `There are ${ this.data.status.ahead } commit${ this.data.status.ahead > 1 ? 's' : '' } that was not pushed to remote.
        Delete this branch will also delete the changes. Do you want to proceed?`,
        data: null,
        decision: {
          noText: 'Cancel',
          yesText: 'Delete'
        }
      };
      this.matDialog.open(YesNoDecisionComponent, {
        width: '380px',
        height: 'auto',
        data: data,
        panelClass: 'bg-primary-black-mat-dialog',
      }).afterClosed().subscribe((isDelete: boolean) => {
        if (isDelete) {
          this.repositoryBranchService.deleteBranch(this.data.repository, this.data.branch);
        }
      });
    } else {
      this.repositoryBranchService.deleteBranch(this.data.repository, this.data.branch);
    }
  }
}
