import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef, MatDialog } from '@angular/material';
import { RepositoryBranchesService, RepositoryBranchSummary } from '../../../../state/DATA/repository-branches';
import { StatusSummary } from '../../../../model/statusSummary.model';
import { RepositoriesService, Repository } from '../../../../state/DATA/repositories';
import { YesNoDecisionComponent } from '../../../UI/dialogs/yes-no-decision/yes-no-decision.component';
import { YesNoDialogModel } from '../../../../model/yesNoDialog.model';
import { map, switchMap, takeWhile } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { BranchRenameComponent } from '../branch-rename/branch-rename.component';

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
    private repositoryBranchService: RepositoryBranchesService,
    private repositoriesService: RepositoriesService,
  ) {
  }

  ngOnInit() {
  }

  renameBranch() {
    const renamingDialogs = this.renamingDialogDecision();
    renamingDialogs
    .pipe(
      takeWhile(val => !!val),
      switchMap((responseRename: {
        name: string;
        remove: boolean;
        push: boolean;
      }) => {
        return this.repositoryBranchService.changeName(
          this.data.repository, this.data.branch, responseRename.name, responseRename.remove, responseRename.push
        );
      })
    )
    .subscribe((data: { changeName, pushRemote, removeRemote }) => {
      console.log(data);
      this._bottomSheetRef.dismiss('RELOAD');
    });
  }

  deleteBranch() {
    if (this.data.status.ahead > 0) {
      const deleteProcess = this.warningDeleteDialog()
      .afterClosed()
      .pipe(
        switchMap((isDelete: boolean) => {
          if (isDelete) {
            // TODO Loading start
            return fromPromise(this.repositoryBranchService.deleteBranch(this.data.repository, this.data.branch));
          }
          return of(null);
        }),
        takeWhile(result => !!result && !!result.local && !!result.remote),
      );
      this.processAfterDeleteProcess(deleteProcess);
    } else {
      // TODO Loading start
      const deleteProcess = fromPromise(this.repositoryBranchService.deleteBranch(this.data.repository, this.data.branch));
      this.processAfterDeleteProcess(deleteProcess);
    }
  }

  warningDeleteDialog() {
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
    return this.matDialog.open(YesNoDecisionComponent, {
      width: '380px',
      height: 'auto',
      data: data,
      panelClass: 'bg-primary-black-mat-dialog',
    });
  }

  processAfterDeleteProcess(deleteStatus: Observable<{ remote, local }>) {
    deleteStatus.pipe(
      switchMap(statusRemove => {
        // TODO Loading end
        if (!!statusRemove.remote || !!statusRemove.local) {
          return fromPromise(this.repositoriesService.load()).pipe(map(() => 'Changes'));
        }
        return of('No Changes');
      })
    ).subscribe(
      statusLoad => {
        console.log(statusLoad);
        if (statusLoad === 'No Changes') {
          this._bottomSheetRef.dismiss('RELOAD');
        }
      }
    );
  }

  private renamingDialogDecision() {
    const data: YesNoDialogModel<RepositoryBranchSummary> = {
      title: 'Rename branch',
      body: `Renaming this branch (${ this.data.branch.name })?`,
      data: this.data.branch,
      decision: {
        noText: 'Cancel',
        yesText: 'Rename'
      }
    };

    return this.matDialog.open(BranchRenameComponent, {
      width: '380px',
      data: data,
      panelClass: 'bg-primary-black-mat-dialog',
    }).afterClosed();
  }
}
