import { Component, OnInit } from '@angular/core';
import { RepositoriesService, Repository } from '../../../shared/state/DATA/repositories';
import { GitLogsService, ListLogLine } from '../../../shared/state/DATA/logs';
import { RepositoryStatusService } from '../../../shared/state/DATA/repository-status';
import { catchError, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';

@Component({
  selector: 'gitme-repo-history',
  templateUrl: './repo-history.component.html',
  styleUrls: ['./repo-history.component.scss']
})
export class RepoHistoryComponent implements OnInit {

  repository: Repository = null;
  viewLogs: ListLogLine = null;

  constructor(
    private repositoryService: RepositoriesService,
    private statusService: RepositoryStatusService,
    private logsService: GitLogsService,
  ) {
    this.repository = this.repositoryService.getActive();
    this.activeViewTracking();
  }

  ngOnInit() {
    this.logsService.initialLogs(this.repository);
  }

  activeViewTracking() {
    this.logsService.observeActive()
    .pipe(
      filter((commit) => !!commit),
      distinctUntilChanged(),
      catchError(err => {
        console.log(err);
        return null;
      }),
      switchMap((log: ListLogLine) => {
        this.viewLogs = log;
        return fromPromise(this.statusService.checkFromCommit(this.repository, log.hash));
      }),
    )
    .subscribe(res => {
      console.log(res);
    });
  }

  openDirectory() {

  }
}
