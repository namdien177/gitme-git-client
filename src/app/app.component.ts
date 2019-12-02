import { AfterViewInit, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { appNode as app, webContentsNode as webContents } from './shared/types/types.electron';
import { ApplicationStateService } from './shared/state/UI/Application-State';
import { RepositoriesService, Repository } from './shared/state/DATA/repositories';
import { RepositoryBranchesService, RepositoryBranchSummary } from './shared/state/DATA/branches';
import { debounceTime, distinctUntilChanged, filter, map, skipUntil, skipWhile, startWith, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { StatusSummary } from './shared/model/statusSummary.model';
import { RepositoryStatusService } from './shared/state/DATA/repository-status';
import { LoadingIndicatorService, LoadingIndicatorState } from './shared/state/UI/Loading-Indicator';
import { fromPromise } from 'rxjs/internal-compatibility';
import { Router } from '@angular/router';
import { deepMutableObject } from './shared/utilities/utilityHelper';
import { MatDialog } from '@angular/material';


@Component({
  selector: 'gitme-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  loadingState: Observable<LoadingIndicatorState>;
  isPromptAuthorize = false;

  private repository: Repository = null;
  private branch: RepositoryBranchSummary = null;

  constructor(
    public appState: ApplicationStateService,
    private repositoriesService: RepositoriesService,
    private repositoryBranchesService: RepositoryBranchesService,
    private repositoryStatusService: RepositoryStatusService,
    private translate: TranslateService,
    private ld: LoadingIndicatorService,
    private router: Router,
    private matDialog: MatDialog
  ) {
    translate.setDefaultLang('en');
    this.listenerFocus();
    /**
     * get active repository
     * get active branch
     * Fetch all data
     * get status
     */
    this.appState.observeApplicationState()
    .pipe(
      filter(value => !value.isLosingFocus),
      filter((data) => !data.isCheckingAuthorize),
      debounceTime(500),
      switchMap(() => this.watchingRepository()), // get current repository => set repository
      skipWhile(() => !this.repository),
      switchMap(() => this.getBranchStatus()),    // git status
      switchMap(() => this.watchingBranch()),     // update branches and get current active branches
      switchMap(() => {
        if (!this.appState.getApplicationState().isCheckingAuthorize) {
          this.appState.setCheckingAuthorize();
        }
        return this.repositoriesService.reAuthorizeProcess(this.repository, this.branch, this.matDialog);
      }),
      skipWhile((authorize) => {
        return !authorize;
      }),
      switchMap(() => this.fetch()),
    )
    .subscribe(
      (status: StatusSummary) => {
        console.log('Repository state is updated');
      }
    );

    this.loadingState = this.ld.observeLoadState();
  }

  ngAfterViewInit(): void {
    this.appState.setBlur();
    this.appState.setFocus();

    this.router.navigateByUrl('/');
  }

  listenerFocus() {
    app.on('browser-window-focus', (event, window) => {
      this.appState.setFocus();
    });
    app.on('browser-window-blur', (event, window) => {
      if (webContents.isDevToolsFocused()) {
      } else {
        this.appState.setBlur();
      }
    });
  }

  /**
   * Get selected repository
   * => update branches
   * => get active branch
   * => update status of current branch
   */
  private watchingRepository() {
    return this.repositoriesService.selectActive().pipe(
      switchMap((selectedRepo: Repository) => {
        this.repository = selectedRepo;
        return of(selectedRepo);
      }),
    );
  }

  /**
   * Return the current status of branch
   */
  private getBranchStatus() {
    if (!!this.repository) {
      return fromPromise(this.repositoryStatusService.status(this.repository));
    }
    return of(null);
  }

  private fetch() {
    this.repository = this.repositoriesService.getActive();
    this.branch = this.repositoryBranchesService.getActive();
    if (!!this.repository && !!this.branch) {
      return this.repositoriesService.fetch(
        deepMutableObject(this.repository) as Repository,
        deepMutableObject(this.branch) as RepositoryBranchSummary
      );
    }
    return of(null);
  }

  private watchingBranch() {
    if (!!this.repository) {
      return fromPromise(this.repositoryBranchesService.updateAll(this.repository));
    }
    return of(null);
  }
}
