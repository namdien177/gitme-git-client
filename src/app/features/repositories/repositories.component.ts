import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { interval, of, Subject } from 'rxjs';
import { RepositoriesMenuService } from '../../shared/state/UI/repositories-menu';
import { catchError, debounceTime, delay, distinctUntilChanged, switchMap, takeUntil, takeWhile, tap, } from 'rxjs/operators';
import { RepositoriesService, Repository } from '../../shared/state/DATA/repositories';
import { StatusSummary } from '../../shared/model/statusSummary.model';
import { RepositoryBranchesService, RepositoryBranchSummary } from '../../shared/state/DATA/branches';
import { RepositoryStatusService } from '../../shared/state/DATA/repository-status';
import { MatDialog } from '@angular/material';
import { YesNoDialogModel } from '../../shared/model/yesNoDialog.model';
import { ConflictViewerComponent } from '../../shared/components/UI/dialogs/conflict-viewer/conflict-viewer.component';
import { LoadingIndicatorService } from '../../shared/state/UI/Loading-Indicator';
import { fromPromise } from 'rxjs/internal-compatibility';
import { ApplicationStateService } from '../../shared/state/UI/Application-State';
import { GitService } from '../../services/features/core/git.service';

@Component({
  selector: 'gitme-repositories',
  templateUrl: './repositories.component.html',
  styleUrls: ['./repositories.component.scss'],
})
export class RepositoriesComponent implements OnInit, OnDestroy, AfterViewInit {

  repository: Repository = null;                  // Repository instance
  statusSummary: StatusSummary;                   // Statistics of changes (file changed, push/pull/commit status)
  branches: RepositoryBranchSummary[] = [];
  activeBranch: RepositoryBranchSummary = null;   // Display current branch

  isRepositoryBoxOpen = false;
  isBranchBoxOpen = false;

  private componentDestroyed: Subject<boolean> = new Subject<boolean>();
  private conflictViewerOpened = false;

  constructor(
    private repoMenuService: RepositoriesMenuService,
    private repositoryState: RepositoriesService,
    private branchState: RepositoryBranchesService,
    private statusState: RepositoryStatusService,
    private appState: ApplicationStateService,
    private matDialog: MatDialog,
    private loading: LoadingIndicatorService,
    private cd: ChangeDetectorRef,
    private git: GitService
  ) {
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.watchingUIState();         // Observing dropdown list of components
    this.watchingRepository();      // Observing repository
    this.watchingBranch();          // Observing branch
    this.watchingStatus();          // Observing branch status
    this.loopRefreshBranchStatus(); // Loop to auto fetching
  }

  ngOnDestroy() {
    this.componentDestroyed.next(true);
  }

  toggleRepositoryBox() {
    this.repoMenuService.toggleRepositoryMenu(this.isRepositoryBoxOpen);
  }

  toggleBranchBox() {
    this.repoMenuService.toggleBranchMenu(this.isBranchBoxOpen);
  }

  clickOutSide(isOutSide: boolean, button: 'repositories' | 'branches') {
    if (isOutSide) {
      switch (button) {
        case 'branches':
          if (this.isBranchBoxOpen) {
            this.repoMenuService.closeBranchMenu();
          }
          break;
        case 'repositories':
          if (this.isRepositoryBoxOpen) {
            this.repoMenuService.closeRepoMenu();
          }
          break;
      }
    }
  }

  actionOnBranch() {
    if (!this.statusSummary || !this.activeBranch || !this.repository) {
      return;
    }
    if (this.activeBranch.has_remote) {
      if (this.statusSummary.ahead > 0 && this.statusSummary.behind === 0) {
        // Push changes
        this.pushRemote();
      } else if (this.statusSummary.ahead >= 0 && this.statusSummary.behind > 0) {
        // Pull changes
        this.pullRemote();
      } else {
        // fetch
        this.fetchRemote();
      }
    } else {
      // push upstream
      this.pushRemote();
    }
  }

  /**
   * Fetching every 30 second.
   * @param loopDuration
   */
  private loopRefreshBranchStatus(loopDuration = 30000) {
    interval(loopDuration)
    .pipe(
      takeUntil(this.componentDestroyed),
      takeWhile(() => !this.appState.getApplicationState().isLosingFocus),
      switchMap(() => {
        if (!!this.repository && !!this.activeBranch) {
          return this.repositoryState.fetch(
            { ...this.repository } as Repository,
            { ...this.activeBranch } as RepositoryBranchSummary,
            true,
          );
        }
        return of(null);
      }),
      switchMap(() => fromPromise(this.branchState.updateAll(this.repository))),
      switchMap(() => fromPromise(this.statusState.status(this.repository))),
    ).subscribe(() => {
      console.log('Sequential loop finished');
    });
  }

  private watchingUIState() {
    this.repoMenuService.select().subscribe(state => {
      this.isRepositoryBoxOpen = state.is_repository_open && !!state.is_available;
      this.isBranchBoxOpen = state.is_branch_open && !!state.is_available;
    });
  }

  /**
   * Retrieve current selected repository
   */
  private watchingRepository() {
    this.repositoryState
    .selectActive()
    .pipe(
      takeUntil(this.componentDestroyed),
      distinctUntilChanged(),
      tap((selectedRepo) => this.repository = selectedRepo),
    )
    .subscribe((selectedRepo: Repository) => {
      this.statusState.status(selectedRepo);
    });
  }

  /**
   * Observing branch status
   */
  private watchingBranch() {
    this.branchState
    .selectActive()
    .pipe(
      takeUntil(this.componentDestroyed),
      distinctUntilChanged(),
    ).subscribe(
      activeBranch => {
        this.activeBranch = activeBranch;
      },
    );
  }

  private watchingStatus() {
    this.statusState.select().pipe(
      distinctUntilChanged(),
      tap(status => {
        if (status.conflicted.length > 0 && !this.conflictViewerOpened) {
          this.conflictViewer();
        }
      }),
    ).subscribe(status => {
      this.statusSummary = status;
      this.cd.detectChanges();
    });
  }

  private fetchRemote() {
    this.loading.setLoading('Fetching!');
    this.repositoryState.fetch(
      { ...this.repository } as Repository,
      { ...this.activeBranch } as RepositoryBranchSummary,
      true,
    ).pipe(
      catchError(error => {
        // potential unauthorized => not care as we handle in the status state
        console.log(error);
        return of(null);
      }),
      switchMap(() => fromPromise(this.branchState.updateAll(this.repository))),
      switchMap(() => fromPromise(this.statusState.status(this.repository))),
    ).subscribe((status) => {
      console.log('Fetch completed');
      this.loading.setFinish();
    });
  }

  private pushRemote() {
    this.loading.setLoading('Pushing to remote. Please wait.');
    this.branchState.push(this.repository, this.activeBranch)
    .pipe(
      catchError(error => {
        // potential conflict => not care as we handle in the status state
        console.log(error);
        return of(null);
      }),
      delay(1500),
      switchMap(() => fromPromise(this.branchState.updateAll(this.repository))),
      switchMap(() => fromPromise(this.statusState.status(this.repository))),
    )
    .subscribe((status) => {
      console.log('Push completed');
      this.loading.setFinish();
    });
  }

  private pullRemote() {
    this.loading.setLoading('Pulling from remote.');
    this.branchState.pull(this.repository, this.activeBranch)
    .pipe(
      catchError(error => {
        // potential conflict => not care as we handle in the status state
        console.log(error);
        return of(null);
      }),
      debounceTime(800),
      switchMap(() => fromPromise(this.branchState.updateAll(this.repository))),
      switchMap(() => fromPromise(this.statusState.status(this.repository))),
    )
    .subscribe(
      (result: StatusSummary) => {
        console.log('Pull completed');
        this.loading.setFinish();
      },
    );
  }

  private conflictViewer() {
    this.conflictViewerOpened = true;
    const dataPassing: YesNoDialogModel = {
      title: 'Conflicts detected',
      body: 'There are some conflicts that need to be resolved before proceeding.',
      data: {
        repository: this.repository,
        branch: this.activeBranch,
      },
      decision: {
        yesText: 'Proceed commit',
        noText: 'Abort',
      },
    };

    this.matDialog.open(ConflictViewerComponent, {
      width: '450px',
      panelClass: 'bg-primary-black-mat-dialog',
      data: dataPassing,
    }).afterClosed()
    .pipe(
      switchMap((decision: boolean) => {
        if (decision) {
          // continue to merge
          const fileList = this.statusSummary.files;
          return fromPromise(this.branchState.continueMerge(this.repository, fileList));
        } else {
          // abort
          return fromPromise(this.branchState.abortMerge(this.repository));
        }
      }),
      switchMap((repository) => this.statusState.status(repository))
    )
    .subscribe(() => {
      this.conflictViewerOpened = false;
    });
  }
}
