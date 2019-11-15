import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, of, Subject } from 'rxjs';
import { RepositoriesMenuService } from '../../shared/state/UI/repositories-menu';
import { distinctUntilChanged, switchMap, takeUntil, takeWhile } from 'rxjs/operators';
import { RepositoriesService, Repository } from '../../shared/state/DATA/repositories';
import { StatusSummary } from '../../shared/model/statusSummary.model';
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
  ) {
    this.watchingUIState();         // Observing dropdown list of components
    this.watchingRepository();      // Observing repository
    this.watchingBranch();          // Observing branch
    this.watchingStatus();          // Observing branch status
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
   * Fetching every 20 second.
   * @param loopDuration
   */
  private loopRefreshBranchStatus(loopDuration = 20000) {
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
        return this.repositoriesService.getBranchStatus(
          this.repository
        );
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
    this.repositoriesService
    .selectActive()
    .pipe(
      takeUntil(this.componentDestroyed),
      distinctUntilChanged()
    )
    .subscribe(
      (selectedRepo: Repository) => {
        this.repository = selectedRepo;
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
      takeUntil(this.componentDestroyed),
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

  private watchingStatus() {
    this.repositoryStatusService.select()
    .subscribe(status => {
      this.statusSummary = status;
    });
  }
}
