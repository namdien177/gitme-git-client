import { Injectable } from '@angular/core';
import { GitLogsStore } from './git-logs.store';
import { GitLogsQuery } from './git-logs.query';
import { GitService } from '../../../../services/features/git.service';
import { Repository } from '../repositories';
import { fromPromise } from 'rxjs/internal-compatibility';
import { deepMutableObject } from '../../../utilities/utilityHelper';
import { Observable } from 'rxjs';
import { ListLogLine, ListLogSummary } from './git-logs.model';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class GitLogsService {

  constructor(
    protected store: GitLogsStore,
    protected query: GitLogsQuery,
    protected git: GitService
  ) {
  }

  initialLogs(repository: Repository) {
    fromPromise(this.git.logs(repository)).subscribe(
      log => {
        const mutable: ListLogSummary = deepMutableObject(log);
        console.log(mutable.all);
        this.store.set(mutable.all);
        this.setActive(mutable.latest.hash);
      }
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
