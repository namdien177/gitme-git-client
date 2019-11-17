import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { GitLogsStore, LogsState } from './git-logs.store';

@Injectable({ providedIn: 'root' })
export class GitLogsQuery extends QueryEntity<LogsState> {

  constructor(protected store: GitLogsStore) {
    super(store);
  }

}
