import { Injectable } from '@angular/core';
import { GitLogsStore } from './git-logs.store';
import { GitLogsQuery } from './git-logs.query';
import { Repository } from '../repositories';
import { GitService } from '../../../../services/features/git.service';
import { fromPromise } from 'rxjs/internal-compatibility';
import { deepMutableObject } from '../../../utilities/utilityHelper';
import { ListLogLine } from './git-logs.model';
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
        const mutable = deepMutableObject(log.all);
        this.store.set(mutable);
        this.setActive(log.latest);
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

  observeActive() {
    return this.query.selectActive().pipe(
      // @ts-ignore
      map(logs => {
        if (Array.isArray(logs)) {
          return logs[0];
        }
        return logs;
      })
    );
  }

  setActive(logs: ListLogLine) {
    const currentActive = this.query.getActive();
    if (!!currentActive || (Array.isArray(currentActive) && currentActive.length > 0)) {
      this.store.removeActive(this.query.getActive());
    }
    this.store.setActive(logs);
  }
}
