import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { ListLogLine, ListLogSummary } from './git-logs.model';
import { Injectable } from '@angular/core';

export interface LogsState extends EntityState<ListLogLine> {
}

export function createInitialState(): ListLogSummary {
  return {
    all: [],
    latest: null,
    total: 20,
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'git-logs', resettable: true })
export class GitLogsStore extends EntityStore<LogsState> {

  constructor() {
    super();
  }

}
