import { ActiveState, EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { ListLogLine } from './git-logs.model';
import { Injectable } from '@angular/core';

export interface LogsState extends EntityState<ListLogLine>, ActiveState {
}

const initialState = {
  active: null
};

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'git-logs', resettable: true, idKey: 'hash' })
export class GitLogsStore extends EntityStore<LogsState> {

  constructor() {
    super(initialState);
  }

}
