import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { appNode as app, webContentsNode as webContents } from './shared/types/types.electron';
import { ApplicationStateService } from './shared/state/UI/Application-State';
import { RepositoriesService, Repository } from './shared/state/DATA/repositories';
import { RepositoryBranchesService, RepositoryBranchSummary } from './shared/state/DATA/branches';
import { debounceTime, filter, skipWhile, startWith, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { StatusSummary } from './shared/model/statusSummary.model';
import { RepositoryStatusService } from './shared/state/DATA/repository-status';
import { LoadingIndicatorService, LoadingIndicatorState } from './shared/state/UI/Loading-Indicator';
import { fromPromise } from 'rxjs/internal-compatibility';
import { ActivatedRoute, Router } from '@angular/router';
import { deepMutableObject } from './shared/utilities/utilityHelper';


@Component({
  selector: 'gitme-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  loadingState: Observable<LoadingIndicatorState>;

  @ViewChild('routerNG', { static: false })
  routerNG: ElementRef<HTMLDivElement>;

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
    private route: ActivatedRoute
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
      filter(value => !value.isLosingFocus),
      debounceTime(500),
      switchMap(() => this.watchingRepository()), // get current repository => set repository
      skipWhile(() => !this.repository),
      switchMap(() => this.watchingBranch()),     // update branches and get current active branches
      switchMap(() => this.getBranchStatus()),    // git status
      switchMap(() => this.fetch()),              // fetch
    )
    .subscribe(
      (status: StatusSummary) => {
        console.log('Repository state is updated');
      }
    );

    this.loadingState = this.ld.observeLoadState();
  }

  ngAfterViewInit(): void {
    this.applicationStateService.setBlur();
    this.applicationStateService.setFocus();

    console.dir(this.routerNG.nativeElement);
    console.log(this.routerNG.nativeElement.childNodes);
    setTimeout(() => {
      console.log(this.routerNG.nativeElement.childNodes);
      if (this.routerNG.nativeElement.childNodes.length <= 2) {
        location.reload();
      }
    }, 1000);
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
