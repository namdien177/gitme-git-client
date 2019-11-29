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
    private repositoryBranchService: RepositoryBranchesService,
    private repositoriesService: RepositoriesService,
    private accountService: AccountListService,
    private cb: ChangeDetectorRef,
    private ld: LoadingIndicatorService
  ) {
    this.currentActiveBranch = this.repositoryBranchService.getActive();
    this.currentAccount = this.accountService.getOneSync(this.data.repository.credential.id_credential);
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
        this.ld.setLoading('Renaming branch');
        return fromPromise(
          this.repositoryBranchService.changeName(
            this.data.repository, this.data.branch, responseRename.name, responseRename.remove, responseRename.push
          )
        );
      }),
      switchMap(() => fromPromise(this.repositoryBranchService.updateAll(this.data.repository))),
      switchMap(branches => fromPromise(this.repositoriesService.updateToDataBase(this.data.repository, branches))),
    )
    .subscribe(() => {
      this.ld.setFinish();
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
            this.ld.setLoading('Deleting branch. Please wait');
            return fromPromise(this.repositoryBranchService.deleteBranch(this.data.repository, this.data.branch));
          }
          return of(null);
        }),
        takeWhile(result => !!result || !!result.local || !!result.remote),
      );
      this.processAfterDeleteProcess(deleteProcess);
    } else {
      this.ld.setLoading('Deleting branch. Please wait');
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
      takeWhile((statusRemove) => !!statusRemove.remote || !!statusRemove.local),
      switchMap(() => fromPromise(this.repositoryBranchService.updateAll(this.data.repository))),
      switchMap(branches => fromPromise(this.repositoriesService.updateToDataBase(this.data.repository, branches)))
    ).subscribe(
      () => {
        this.ld.setFinish();
        this._bottomSheetRef.dismiss('RELOAD');
      }
    );
  }

  openMerge() {
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

    dialogMerge.afterClosed().subscribe(decision => {
      console.log(decision);
    });
  }

  checkMergeCondition() {
    this.mergeStatusLoading = true;
    this.repositoryBranchService.getMergeStatus(
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
