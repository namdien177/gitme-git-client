import { AfterViewInit, Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { appNode as app, webContentsNode as webContents } from './shared/types/types.electron';
import { ApplicationStateService } from './shared/state/UI/Application-State';
import { RepositoriesService, Repository } from './shared/state/DATA/repositories';
import { RepositoryBranchesService, RepositoryBranchSummary } from './shared/state/DATA/repository-branches';
import { distinctUntilChanged, startWith, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { StatusSummary } from './shared/model/statusSummary.model';
import { RepositoryStatusService } from './shared/state/DATA/repository-status';
import { LoadingIndicatorService, LoadingIndicatorState } from './shared/state/system/Loading-Indicator';


@Component({
  selector: 'gitme-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  private repository: Repository = null;
  private branch: RepositoryBranchSummary = null;

  loadingState: Observable<LoadingIndicatorState>;

  constructor(
    public applicationStateService: ApplicationStateService,
    private repositoriesService: RepositoriesService,
    private repositoryBranchesService: RepositoryBranchesService,
    private repositoryStatusService: RepositoryStatusService,
    private translate: TranslateService,
    private ld: LoadingIndicatorService
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
      startWith({ isLosingFocus: false }),
      switchMap(() => this.watchingRepository()),
      switchMap(() => this.getActiveBranch()),
      switchMap(() => this.getBranchStatus()),
      switchMap((status: StatusSummary) => {
        this.repositoryStatusService.set(status);
        return this.fetch();
      }),
    )
    .subscribe(
      (fetchStatus) => {
        console.log(fetchStatus);
      }
    );

    this.loadingState = this.ld.observeLoadState();
  }

  ngAfterViewInit(): void {
    this.applicationStateService.setBlur();
    this.applicationStateService.setFocus();
  }

  listenerFocus() {
    app.on('browser-window-focus', (event, window) => {
      console.log('browser-window-focus', window.webContents.id);
      this.applicationStateService.setFocus();
    });
    app.on('browser-window-blur', (event, window) => {
      if (webContents.isDevToolsFocused()) {
        console.log('Ignore this case');
      } else {
        console.log('browser-window-blur', window.webContents.id);
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
    return this.repositoriesService
    .selectActive(true)
    .pipe(
      switchMap((selectedRepo: Repository) => {
        this.repository = selectedRepo;
        return of(null);
      }),
      switchMap(() => this.repositoryBranchesService.updateAll(this.repository)),
    );
  }

  /**
   * Return the current status of branch
   */
  private getBranchStatus() {
    if (!!this.repository) {
      return this.repositoriesService.gitStatus(
        this.repository
      );
    }
    return of(null);
  }

  private getActiveBranch() {
    return this.repositoryBranchesService
    .selectActive().pipe(
      switchMap(activeBranch => {
          this.branch = activeBranch;
          return of(activeBranch);
        }
      )
    );
  }

  private fetch() {
    if (!!this.repository && !!this.branch) {
      return this.repositoriesService.fetch(
        { ...this.repository } as Repository,
        { ...this.branch } as RepositoryBranchSummary
      );
    }
    return of(null);
  }
}
