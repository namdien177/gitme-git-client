import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef, MatDialog } from '@angular/material';
import { RepositoryBranchesService, RepositoryBranchSummary } from '../../../../state/DATA/branches';
import { StatusSummary } from '../../../../model/statusSummary.model';
import { RepositoriesService, Repository } from '../../../../state/DATA/repositories';
import { YesNoDecisionComponent } from '../../../UI/dialogs/yes-no-decision/yes-no-decision.component';
import { YesNoDialogModel } from '../../../../model/yesNoDialog.model';
import { switchMap, takeWhile } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { fromPromise } from 'rxjs/internal-compatibility';
import { BranchRenameComponent } from '../branch-rename/branch-rename.component';
import { BranchMergeComponent } from '../branch-merge/branch-merge.component';
import { Account, AccountListService } from '../../../../state/DATA/accounts';
import { ComputedAction, MergeResult } from '../../../../model/merge.interface';
import { LoadingIndicatorService } from '../../../../state/UI/Loading-Indicator';
import { RepositoryStatusService } from '../../../../state/DATA/repository-status';
import { GitLogsService } from '../../../../state/DATA/logs';
import { GitDiffService } from '../../../../state/DATA/git-diff';

@Component({
  selector: 'gitme-branch-options',
  templateUrl: './branch-options.component.html',
  styleUrls: ['./branch-options.component.scss']
})
export class BranchOptionsComponent implements OnInit {

  statusMerge: MergeResult = null;
  mergeStatusLoading = false;
  private readonly currentActiveBranch: RepositoryBranchSummary = null;
  private currentAccount: Account = null;

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<BranchOptionsComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: {
      branch: RepositoryBranchSummary
      status: StatusSummary,
      repository: Repository
    },
    private matDialog: MatDialog,
    private branchState: RepositoryBranchesService,
    private repositoryState: RepositoriesService,
    private accountState: AccountListService,
    private statusState: RepositoryStatusService,
    private logState: GitLogsService,
    private diffState: GitDiffService,
    private cb: ChangeDetectorRef,
    private ld: LoadingIndicatorService
  ) {
    this.currentActiveBranch = this.branchState.getActive();
    this.currentAccount = this.accountState.getOneSync(this.data.repository.credential.id_credential);
  }

  get computedAction() {
    return ComputedAction;
  }

  get isMaster() {
    return this.data.branch.name === 'master';
  }

  get isCurrent() {
    return this.data.branch.name === this.currentActiveBranch.name;
  }

  ngOnInit() {
    this.checkMergeCondition();
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
        this.ld.setLoading('Analyzing current branch');
        return fromPromise(
          this.branchState.changeName(
            this.data.repository, this.data.branch, responseRename.name, responseRename.remove, responseRename.push
          )
        );
      }),
      switchMap(() => fromPromise(this.branchState.updateAll(this.data.repository))),
      switchMap(branches => fromPromise(this.repositoryState.updateToDataBase(this.data.repository, branches))),
    )
    .subscribe(() => {
      this.ld.setFinish();
      this._bottomSheetRef.dismiss('RELOAD');
    }, err => {
      console.log(err);
      this.ld.setFinish();
    });
  }

  deleteBranch() {
    if (this.data.status.ahead > 0) {
      const deleteProcess = this.warningDeleteDialog()
      .afterClosed()
      .pipe(
        switchMap((isDelete: boolean) => {
          if (isDelete) {
            this.ld.setLoading('Deleting branch. Please wait');
            return fromPromise(this.branchState.deleteBranch(this.data.repository, this.data.branch));
          }
          return of(null);
        }),
        takeWhile(result => !!result || !!result.local || !!result.remote),
      );
      this.processAfterDeleteProcess(deleteProcess);
    } else {
      this.ld.setLoading('Deleting branch. Please wait');
      const deleteProcess = fromPromise(this.branchState.deleteBranch(this.data.repository, this.data.branch));
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
      takeWhile((statusRemove) => !!statusRemove.remote || !!statusRemove.local),
      switchMap(() => fromPromise(this.branchState.updateAll(this.data.repository))),
      switchMap(branches => fromPromise(this.repositoryState.updateToDataBase(this.data.repository, branches)))
    ).subscribe(
      () => {
        this.ld.setFinish();
        this._bottomSheetRef.dismiss('RELOAD');
      }
    );
  }

  openMerge() {
    if (
      (!!this.statusMerge || this.mergeStatusLoading) &&
      this.computedAction.Clean === this.statusMerge.kind && !this.statusMerge['entries']
    ) {
      return;
    }
    const dataMerge: YesNoDialogModel = {
      title: 'Merge status',
      body: `Checking status of merge from branch ${ this.data.branch.name } to ${ this.currentActiveBranch.name }.`,
      data: {
        branchFrom: this.data.branch,
        branchTarget: this.currentActiveBranch,
        repository: this.data.repository
      },
      decision: {
        noText: 'Cancel',
        yesText: 'Merge'
      }
    };

    const dialogMerge = this.matDialog.open(
      BranchMergeComponent, {
        width: '500px',
        data: dataMerge,
        panelClass: 'bg-primary-black-mat-dialog',
      }
    );

    dialogMerge.afterClosed()
    .pipe(
      switchMap(() => of(this.diffState.reset())),
      switchMap(() => this.logState.initialLogs(this.data.repository)),
      switchMap(() => fromPromise(this.branchState.updateAll(this.data.repository))),
      switchMap(branches => fromPromise(this.repositoryState.updateToDataBase(this.data.repository, branches))),
      switchMap(() => fromPromise(this.statusState.status(this.data.repository)))
    )
    .subscribe(decision => {
    });
  }

  checkMergeCondition() {
    this.mergeStatusLoading = true;
    this.branchState.getMergeStatus(
      this.data.repository,
      this.data.branch,
      this.currentActiveBranch
    ).pipe()
    .subscribe(status => {
      this.mergeStatusLoading = false;
      this.statusMerge = status;
      this.cb.detectChanges();
    });
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
