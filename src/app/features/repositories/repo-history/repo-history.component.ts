import { Component, OnInit } from '@angular/core';
import { RepositoriesService, Repository } from '../../../shared/state/DATA/repositories';
import { GitLogsService, ListLogLine } from '../../../shared/state/DATA/logs';
import { RepositoryStatusService } from '../../../shared/state/DATA/repository-status';
import { distinctUntilChanged, filter } from 'rxjs/operators';

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

    this.statusService.checkFromCommit(this.repository, 'c02307e').then(res => {
      console.log(res);
    });

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
    )
    .subscribe((log: any) => {
      this.viewLogs = log;
      console.log(log);
    }, error => {
      console.log(error);
      this.viewLogs = null;
    });
  }
}
