import { Component, OnInit } from '@angular/core';
import { GitLogsService, ListLogLine } from '../../../state/DATA/logs';
import { Observable } from 'rxjs';
import { distinctUntilChanged, skipWhile, switchMap, tap } from 'rxjs/operators';
import { RepositoriesService, Repository } from '../../../state/DATA/repositories';

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
    private repositoriesService: RepositoriesService,
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
    const activeRepository: Repository = this.repositoriesService.getActive();
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
}
