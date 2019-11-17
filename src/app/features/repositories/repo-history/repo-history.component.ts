import { Component, OnInit } from '@angular/core';
import { RepositoriesService, Repository } from '../../../shared/state/DATA/repositories';
import { GitLogsService, ListLogLine } from '../../../shared/state/DATA/logs';

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
    private logsService: GitLogsService,
  ) {
    this.repository = this.repositoryService.getActive();
    this.logsService.observeActive()
    .subscribe(log => {
      this.viewLogs = log;
      console.log(log);
    }, error => {
      console.log(error);
      this.viewLogs = null;
    });
  }

  ngOnInit() {
    this.logsService.initialLogs(this.repository);
  }

}
