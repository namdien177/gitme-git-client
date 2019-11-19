import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { GitLogsService, ListLogLine } from '../../../state/DATA/logs';
import { Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'gitme-logs-list',
  templateUrl: './logs-list.component.html',
  styleUrls: ['./logs-list.component.scss']
})
export class LogsListComponent implements OnInit {

  logList: Observable<ListLogLine[]>;
  activeHash: Observable<ListLogLine> = null;

  constructor(
    private logService: GitLogsService,
    private cd: ChangeDetectorRef
  ) {
    this.logList = this.logService.observeLogs();
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

  }
}
