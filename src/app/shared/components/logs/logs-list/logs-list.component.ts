import { Component, OnInit } from '@angular/core';
import { GitLogsService, ListLogLine } from '../../../state/DATA/logs';
import { Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, skipWhile, switchMap, tap } from 'rxjs/operators';
import { RepositoriesService, Repository } from '../../../state/DATA/repositories';
import { RepositoryStatusService } from '../../../state/DATA/repository-status';
import { MatBottomSheet } from '@angular/material';
import { RevertOptionsComponent } from '../_dialogs/revert-options/revert-options.component';
import { YesNoDialogModel } from '../../../model/yesNoDialog.model';
import { fromPromise } from 'rxjs/internal-compatibility';
import { RepositoryBranchesService } from '../../../state/DATA/branches';
import { GitDiffService } from '../../../state/DATA/git-diff';

@Component({
  selector: 'gitme-logs-list',
  templateUrl: './logs-list.component.html',
  styleUrls: ['./logs-list.component.scss']
})
export class LogsListComponent implements OnInit {

  logList: Observable<ListLogLine[]>;
  activeHash: Observable<ListLogLine> = null;

  previousDate: string = null;
  lastDate: string = null;
  allCommitConfirmed = false;
  lastHash: string = null;

  constructor(
    private logService: GitLogsService,
    private repositoryState: RepositoriesService,
    private statusState: RepositoryStatusService,
    private branchState: RepositoryBranchesService,
    private diffState: GitDiffService,
    private bottomSheet: MatBottomSheet
  ) {
    this.logList = this.logService.observeLogs().pipe(
      skipWhile(s => !s || s.length === 0),
      tap(all => {
        if (all) {
          const last = [...all].pop();
          const first = [...all].shift();
          this.previousDate = first ? first.date : null;
          this.lastDate = last ? last.date : null;
          this.lastHash = last ? last.hash : null;
        }
      })
    );
    this.activeHash = this.logService.observeActive().pipe(
      distinctUntilChanged(),
    );
  }

  ngOnInit() {
  }

  viewLog(hash: string) {
    this.logService.setActive(hash);
  }

  viewMore() {
    const activeRepository: Repository = this.repositoryState.getActive();
    this.logService.getMoreLogs(activeRepository, this.lastDate)
    .pipe(
      switchMap(newdata => {
        if (newdata.all.length > 0) {
          this.lastHash = [...newdata.all].pop().hash;
        }
        return this.logService.getLastLog(activeRepository);
      })
    )
    .subscribe(firstLog => {
      this.allCommitConfirmed = firstLog && firstLog === this.lastHash;
    });
  }

  revert(hash: string, i: number) {
    const repository: Repository = this.repositoryState.getActive();
    const currentStatus = this.statusState.get();
    const isLocal = i + 1 <= currentStatus.ahead;
    // if local, allow option to delete the previous commit
    const data: YesNoDialogModel = {
      title: 'Commit Options',
      body: null,
      data: {
        hash: hash,
        index: i,
        isLocal
      },
      decision: {
        noText: 'Cancel',
        yesText: 'Apply'
      }
    };
    const revertOptionSheet = this.bottomSheet.open(
      RevertOptionsComponent, {
        panelClass: ['bg-primary-black', 'p-2-option'],
        data: data
      }
    );

    revertOptionSheet.afterDismissed()
    .pipe(
      filter(res => !!res),
      switchMap(() => fromPromise(this.statusState.status(repository))),
      switchMap(() => this.logService.initialLogs(repository)),
      switchMap(() => of(this.diffState.reset())),
      switchMap(() => fromPromise(this.branchState.updateAll(repository))),
      switchMap(branches => fromPromise(this.repositoryState.updateToDataBase(repository, branches)))
    )
    .subscribe(choice => {
      console.log(choice);
    });
  }
}
