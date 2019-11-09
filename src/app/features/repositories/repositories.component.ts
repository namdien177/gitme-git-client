import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, of, Subject } from 'rxjs';
import { RepositoriesMenuService } from '../../shared/state/UI/repositories-menu';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, takeWhile, tap } from 'rxjs/operators';
import { RepositoriesService, Repository } from '../../shared/state/DATA/repositories';
import { StatusSummary } from '../../shared/model/statusSummary.model';
import { FileWatchesService } from '../../shared/state/system/File-Watches';
import { RepositoryBranchesService, RepositoryBranchSummary } from '../../shared/state/DATA/repository-branches';
import { RepositoryStatusService } from '../../shared/state/DATA/repository-status';

@Component({
  selector: 'gitme-repositories',
  templateUrl: './repositories.component.html',
  styleUrls: ['./repositories.component.scss']
})
export class RepositoriesComponent implements OnInit, OnDestroy {

  repository: Repository = null;                  // Repository instance
  statusSummary: StatusSummary;                   // Statistics of changes (file changed, push/pull/commit status)
  branches: RepositoryBranchSummary[] = [];
  activeBranch: RepositoryBranchSummary = null;   // Display current branch

  isRepositoryBoxOpen = false;
  isBranchBoxOpen = false;
  isViewChangeTo: 'changes' | 'history' = 'changes';

  private componentDestroyed: Subject<boolean> = new Subject<boolean>();

  constructor(
    private repoMenuService: RepositoriesMenuService,
    private repositoriesService: RepositoriesService,
    private repositoryBranchesService: RepositoryBranchesService,
    private repositoryStatusService: RepositoryStatusService,
    private fileWatchesService: FileWatchesService,
  ) {
    this.watchingUIState();         // Observing dropdown list of components
    this.watchingRepository();      // Observing repository
    this.watchingBranch();          // Observing repository
    // this.watchingFileChanges();     // Observing file changes by chokidar
    this.loopRefreshBranchStatus(); // Loop to auto fetching
  }

  ngOnInit() {
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

  commitMenuCategory(view: 'changes' | 'history') {
    this.isViewChangeTo = view;

    if (view === 'changes') {

    } else {

    }
  }

  /**
   * Default looping 15s
   * Fetching and retrieve status for every 5 second.
   * @param loopDuration
   */
  private loopRefreshBranchStatus(loopDuration = 5000) {
    interval(loopDuration)
    .pipe(
      takeUntil(this.componentDestroyed),
      takeWhile(() => this.isViewChangeTo === 'changes'),
      switchMap(() => {
        if (!!this.repository && !!this.activeBranch) {
          return this.repositoriesService.fetch(
            { ...this.repository } as Repository,
            { ...this.activeBranch } as RepositoryBranchSummary
          );
        }
        return of(null);
      }),
      distinctUntilChanged(),
      switchMap(() => {
        return this.observingBranchStatus();
      }),
      distinctUntilChanged(),
    ).subscribe((status) => {
      this.statusSummary = status;
      if (status) {
        this.repositoryStatusService.set(status);
      }
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
    this.repositoriesService.selectActive(true)
    .pipe(
      distinctUntilChanged(),
      switchMap((selectedRepo: Repository) => {
        this.repository = selectedRepo;
        // TODO: check chodikar
        // if (!!this.repository) {
        //   const newDir = this.repository.directory;
        //   return fromPromise(this.fileWatchesService.switchTo(newDir));
        // }
        return of(null);
      }),
      tap(() => this.repositoryBranchesService.load(this.repository)),
      switchMap(() => this.observingBranchStatus()),
      distinctUntilChanged(),
    )
    .subscribe(
      (status: StatusSummary) => {
        this.statusSummary = status;
        if (status) {
          this.repositoryStatusService.set(status);
        }
      }
    );
  }

  /**
   * Observing branch status
   */
  private watchingBranch() {
    this.repositoryBranchesService
    .select()
    .pipe(
      switchMap(listBranch => {
        this.branches = listBranch;
        return this.repositoryBranchesService.selectActive();
      })
    )
    .subscribe(
      activeBranch => {
        this.activeBranch = activeBranch;
      }
    );
  }

  /**
   * Start listening to changes by Chokidar for better performance and cross-platform support
   */
  private watchingFileChanges() {
    this.fileWatchesService.selectChanges().pipe(
      takeUntil(this.componentDestroyed),
      takeWhile(() => this.isViewChangeTo === 'changes'),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(() => this.observingBranchStatus()),
      distinctUntilChanged()
    ).subscribe(
      (status: StatusSummary) => {
        this.statusSummary = status;
        if (status) {
          this.repositoryStatusService.set(status);
        }
      }
    );
  }

  /**
   * Return the current status of branch
   */
  private observingBranchStatus() {
    if (!!this.repository) {
      return this.repositoriesService.getBranchStatus(
        this.repository
      );
    }
    return of(null);
  }
}
