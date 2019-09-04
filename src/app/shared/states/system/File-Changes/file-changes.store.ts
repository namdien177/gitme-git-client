import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { FileChange } from './file-change.model';

export interface FileChangesState extends EntityState<FileChange> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'file-changes' })
export class FileChangesStore extends EntityStore<FileChangesState> {

  constructor() {
    super();
  }

}

