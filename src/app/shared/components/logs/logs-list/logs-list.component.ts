import { Component, OnInit } from '@angular/core';
import { GitLogsService, ListLogLine } from '../../../state/DATA/logs';
import { Observable } from 'rxjs';

@Component({
  selector: 'gitme-logs-list',
  templateUrl: './logs-list.component.html',
  styleUrls: ['./logs-list.component.scss']
})
export class LogsListComponent implements OnInit {

  logList: Observable<ListLogLine[]>;

  constructor(
    private logService: GitLogsService
  ) {
    this.logList = this.logService.observeLogs();
  }

  ngOnInit() {
  }

  viewLog() {

  }

  viewMore() {

  }
}