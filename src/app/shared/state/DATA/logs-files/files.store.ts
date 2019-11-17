import { Injectable } from '@angular/core';
import { ActiveState, EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { LogFile } from './files.model';

export interface LogFileState extends EntityState<LogFile>, ActiveState {
}

const initialState = {
  active: null
};

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'repositories', resettable: true, idKey: 'path' })
export class FilesStore extends EntityStore<LogFileState> {

  constructor() {
    super(initialState);
  }

}

