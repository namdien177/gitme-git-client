import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { FilesStore, LogFileState } from './files.store';

@Injectable({ providedIn: 'root' })
export class FilesQuery extends QueryEntity<LogFileState> {

  constructor(protected store: FilesStore) {
    super(store);
  }

}
