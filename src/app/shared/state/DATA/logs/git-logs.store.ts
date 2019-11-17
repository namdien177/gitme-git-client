import { ActiveState, EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { ListLogLine } from './git-logs.model';
import { Injectable } from '@angular/core';

export interface LogsState extends EntityState<ListLogLine> {
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'git-logs', resettable: true })
export class GitLogsStore extends EntityStore<LogsState> {

  constructor() {
    super();
  }

}
