import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RepositoryBranchesService, RepositoryBranchSummary } from '../../../state/DATA/repository-branches';
import { RepositoriesService, Repository } from '../../../state/DATA/repositories';
import { MatDialog } from '@angular/material';
import { BranchNewOptionComponent } from '../_dialogs/branch-new/branch-new-option/branch-new-option.component';
import { map, switchMap, takeWhile } from 'rxjs/operators';
import { defaultCommitOptionDialog, YesNoDialogModel } from '../../../model/yesNoDialog.model';
import { of } from 'rxjs';
import { StatusSummary } from '../../../model/statusSummary.model';
import { BranchCheckoutStashComponent } from '../_dialogs/branch-new/branch-checkout-stash/branch-checkout-stash.component';

@Component({
  selector: 'gitme-repo-branches',
  templateUrl: './list-branches.component.html',
  styleUrls: ['./list-branches.component.scss']
})
export class ListBranchesComponent implements OnInit, AfterViewInit {

  repository: Repository = null;
  branch: RepositoryBranchSummary = null;

  @Input()
  branches: RepositoryBranchSummary[] = [];
  @Output()
  branchesChange: EventEmitter<RepositoryBranchSummary[]> = new EventEmitter();

  _temporaryBranchInfo: {
    name: string,
    fromBranch: string
  } = null;

  constructor(
    private repositoryBranchesService: RepositoryBranchesService,
    private repositoriesService: RepositoriesService,
    private matDialog: MatDialog
  ) {
    this.repositoryBranchesService.selectActive().subscribe(
      br => this.branch = br
    );
    this.repositoriesService.selectActive().subscribe(
      rp => this.repository = rp
    );
  }

  ngAfterViewInit(): void {
  }

  ngOnInit() {
    console.log(this.branches);
  }

  openOptionNewBranch() {
    const data: YesNoDialogModel = {
      title: 'New Branch',
      body: null,
      data: {
        repository: this.repository,
        branch: this.branch
      },
      decision: {
        noText: 'Cancel',
        yesText: 'Create'
      }
    };
    this._temporaryBranchInfo = null;

    const dialogOpenInitial = this.matDialog.open(
      BranchNewOptionComponent, {
        width: '380px',
        height: 'auto',
        data: data,
        panelClass: 'bg-primary-black-mat-dialog',
      }
    );

    dialogOpenInitial.afterClosed().pipe(
      takeWhile(fromStatus => !!fromStatus),
      switchMap(newBranch => {
        this._temporaryBranchInfo = newBranch;
        return this.repositoriesService.getBranchStatus(this.repository);
      }),
      map((
        // Have changes => stash or bring?
        checkAvailable: StatusSummary) => checkAvailable.files.length > 0
      ),
      switchMap((needStash: boolean) => {
        if (needStash) {
          return this.openStashMenu();
        }
        return of(2);
      }),
      takeWhile(action => action !== 0),
      switchMap(
        /**
         * @param final Choices from making a new branch
         * 1 = stash
         * 2 = bring changes to
         */
        (final: 1 | 2) => {
          return this.createBranchMethod(final);
        }
      ),
    ).subscribe(
      action => {
        console.log(action);
      }
    );
  }

  openStashMenu() {
    const defaultStash = defaultCommitOptionDialog;
    defaultStash.title = 'Oops! There are some changes on current branch!';
    defaultStash.body = 'What should we do with it?';
    return this.matDialog.open(BranchCheckoutStashComponent, {
      width: '380px',
      height: 'auto',
      panelClass: 'bg-primary-black-mat-dialog',
      data: defaultStash
    }).afterClosed().pipe(
      map(res => res === undefined ? 0 : res)
    );
  }

  createBranchMethod(methodCode: 1 | 2) {
    const branchToGo = this._temporaryBranchInfo.fromBranch === this.branch.name ?
      null : this._temporaryBranchInfo.fromBranch;
    if (methodCode === 2) {
      // create new branch and bring changes to
      return this.repositoryBranchesService.newBranchFrom(
        this.repository,
        this._temporaryBranchInfo.name,
        branchToGo
      );
    }

    // stash changes and create new branch
    return this.repositoryBranchesService.stashChanges(this.repository).pipe(
      switchMap(stash => {
        console.log(stash);
        return this.repositoryBranchesService.newBranchFrom(
          this.repository,
          this._temporaryBranchInfo.name,
          branchToGo
        );
      })
    );
  }
}
