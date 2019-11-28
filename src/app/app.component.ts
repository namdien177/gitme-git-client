import { AfterViewInit, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { appNode as app, webContentsNode as webContents } from './shared/types/types.electron';
import { ApplicationStateService } from './shared/state/UI/Application-State';
import { RepositoriesService, Repository } from './shared/state/DATA/repositories';
import { RepositoryBranchesService, RepositoryBranchSummary } from './shared/state/DATA/branches';
import { debounceTime, filter, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { StatusSummary } from './shared/model/statusSummary.model';
import { RepositoryStatusService } from './shared/state/DATA/repository-status';
import { LoadingIndicatorService, LoadingIndicatorState } from './shared/state/UI/Loading-Indicator';
import { fromPromise } from 'rxjs/internal-compatibility';
import { Router } from '@angular/router';
import { deepMutableObject } from './shared/utilities/utilityHelper';
import { ElectronService } from './services/system/electron.service';


@Component({
  selector: 'gitme-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  loadingState: Observable<LoadingIndicatorState>;

  private repository: Repository = null;
  private branch: RepositoryBranchSummary = null;

  constructor(
    public applicationStateService: ApplicationStateService,
    private repositoriesService: RepositoriesService,
    private repositoryBranchesService: RepositoryBranchesService,
    private repositoryStatusService: RepositoryStatusService,
    private translate: TranslateService,
    private ld: LoadingIndicatorService,
    private router: Router,
    private electron: ElectronService
  ) {
    translate.setDefaultLang('en');
    this.listenerFocus();
    /**
     * get active repository
     * get active branch
     * Fetch all data
     * get status
     */
    this.applicationStateService.observeApplicationState()
    .pipe(
      filter(value => !value.isLosingFocus),
      debounceTime(500),
      switchMap(() => this.watchingRepository()), // get current repository => set repository
      switchMap(() => this.watchingBranch()),     // update branches and get current active branches
      switchMap(() => this.fetch()),              // fetch
      switchMap(() => fromPromise(this.repositoryBranchesService.updateAll(this.repository))),
      switchMap(() => fromPromise(this.repositoryStatusService.status(this.repository))),
    )
    .subscribe(
      (status: StatusSummary) => {
        console.log(status);
        console.log('Repository state is updated');
      }
    );

    this.loadingState = this.ld.observeLoadState();
    this.applicationStateService.setBlur();
    this.electron.initializeConfigFromLocalDatabase().then(() => {
      this.applicationStateService.setFocus();
      this.router.navigateByUrl('/');
    });
  }

  ngAfterViewInit(): void {
  }

  listenerFocus() {
    app.on('browser-window-focus', (event, window) => {
      this.applicationStateService.setFocus();
    });
    app.on('browser-window-blur', (event, window) => {
      if (webContents.isDevToolsFocused()) {
      } else {
        this.applicationStateService.setBlur();
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
