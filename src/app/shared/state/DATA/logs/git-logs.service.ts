import { Injectable } from '@angular/core';
import { GitLogsStore } from './git-logs.store';
import { GitLogsQuery } from './git-logs.query';
import { GitService } from '../../../../services/features/core/git.service';
import { Repository } from '../repositories';
import { fromPromise } from 'rxjs/internal-compatibility';
import { deepMutableObject } from '../../../utilities/utilityHelper';
import { Observable, of } from 'rxjs';
import { ListLogLine, ListLogSummary } from './git-logs.model';
import { map, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class GitLogsService {

  constructor(
    protected store: GitLogsStore,
    protected query: GitLogsQuery,
    protected git: GitService
  ) {
  }

  initialLogs(repository: Repository) {
    return fromPromise(this.git.getLogs(repository)).pipe(
      switchMap(log => {
        const mutable: ListLogSummary = deepMutableObject(log);
        this.store.set(mutable.all);
        this.setActive(mutable.latest.hash);
        return of(mutable);
      })
    );
  }

  getMoreLogs(repository: Repository, beforeDate: string) {
    return fromPromise(this.git.getLogs(repository, beforeDate)).pipe(
      switchMap(log => {
        const mutable: ListLogSummary = deepMutableObject(log);
        this.store.add(mutable.all);
        return of(mutable);
      }),
    );
  }

  getLastLog(repository: Repository) {
    return fromPromise(this.git.getFirstLog(repository)).pipe(
      map(re => {
        return re.replace('\n', '');
      })
    );
  }

  getLogs() {
    return this.query.getAll();
  }

  getLogsActive() {
    return this.query.getActive();
  }

  observeLogs() {
    return this.query.selectAll();
  }

  observeActive(): Observable<ListLogLine> {
    return this.query.selectActive()
    .pipe(
      map(logs => {
        if (Array.isArray(logs)) {
          return logs[0];
        }
        return logs;
      })
    );
  }

  setActive(logsHash: string) {
    const currentActive = this.query.getActive();
    if (!!currentActive || (Array.isArray(currentActive) && currentActive.length > 0)) {
      this.store.removeActive(this.query.getActive());
    }
    this.store.setActive(logsHash);
  }
}
