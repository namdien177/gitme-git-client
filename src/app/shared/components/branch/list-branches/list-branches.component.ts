import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { RepositoryBranchesService, RepositoryBranchSummary } from '../../../state/DATA/branches';
import { RepositoriesService, Repository } from '../../../state/DATA/repositories';
import { MatDialog } from '@angular/material';
import { BranchNewOptionComponent } from '../_dialogs/branch-new/branch-new-option/branch-new-option.component';
import { debounceTime, distinctUntilChanged, filter, map, switchMap, takeWhile, tap } from 'rxjs/operators';
import { YesNoDialogModel } from '../../../model/yesNoDialog.model';
import { of, Subject } from 'rxjs';
import { StatusSummary } from '../../../model/statusSummary.model';
import { fromPromise } from 'rxjs/internal-compatibility';
import { RepositoryStatusService } from '../../../state/DATA/repository-status';
import { BranchStashComponent } from '../_dialogs/branch-stash/branch-stash.component';

@Component({
  selector: 'gitme-repo-branches',
  templateUrl: './list-branches.component.html',
  styleUrls: ['./list-branches.component.scss']
})
export class ListBranchesComponent implements OnInit, AfterViewInit {

  repository: Repository = null;
  branch: RepositoryBranchSummary = null;

  branches: RepositoryBranchSummary[] = [];
  @Output()
  branchesChange: EventEmitter<RepositoryBranchSummary[]> = new EventEmitter();

  searchText: string = null;
  searchBranches: RepositoryBranchSummary[] = [];
  searchPipes: Subject<string> = new Subject<string>();

  _temporaryBranchInfo: {
    name: string,
    fromBranch: string
  } = null;

  constructor(
    private branchesService: RepositoryBranchesService,
    private repositoriesService: RepositoriesService,
    private statusService: RepositoryStatusService,
    private matDialog: MatDialog
  ) {
    this.branchesService.selectActive().subscribe(
      br => this.branch = br
    );
    this.branchesService.select().subscribe(
      br => this.branches = br
    );
    this.repositoriesService.selectActive().subscribe(
      rp => this.repository = rp
    );
  }

  ngAfterViewInit(): void {
    this.searchPipes.pipe(
      debounceTime(200),
      tap(() => this.searchBranches = []),
      distinctUntilChanged(),
      filter(text => !!text && text.length > 2),
    ).subscribe(text => {
      const regex = new RegExp(`${ text }`, `g`);
      console.log(regex);
      this.branches.forEach(branch => {
        if (branch.name.match(regex)) {
          this.searchBranches.push(branch);
        }
      });
    });
  }

  ngOnInit() {
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
        return fromPromise(this.statusService.status(this.repository));
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
      switchMap(() => fromPromise(this.branchesService.updateAll(this.repository))),
      switchMap(branches => fromPromise(this.repositoriesService.updateToDataBase(this.repository, branches)))
    ).subscribe(
      action => {
        console.log(action);
      }
    );
  }

  openStashMenu() {
    const warnChanges: YesNoDialogModel = {
      title: 'Failed to checkout',
      body: 'There are changes that need to be committed before checkout to a new branch',
      data: null,
      decision: {
        noText: 'Cancel',
        yesText: 'Apply'
      }
    };
    return this.matDialog.open(BranchStashComponent, {
      width: '280px',
      height: 'auto',
      data: warnChanges,
      panelClass: 'bg-primary-black-mat-dialog',
    }).afterClosed().pipe(
      map(() => 0)
    );
  }

  createBranchMethod(methodCode: 1 | 2) {
    const branchToGo = this._temporaryBranchInfo.fromBranch === this.branch.name ?
      null : this._temporaryBranchInfo.fromBranch;
    if (methodCode === 2) {
      // create new branch and bring changes to
      return this.branchesService.newBranchFrom(
        this.repository,
        this._temporaryBranchInfo.name,
        branchToGo
      );
    }
  }

  trackBranchID(index: number, item: RepositoryBranchSummary) {
    return item.id;
  }

  onSearchText() {
    this.searchPipes.next(this.searchText);
  }
}
