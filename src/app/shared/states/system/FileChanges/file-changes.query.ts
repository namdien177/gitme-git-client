import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { FileChangesState, FileChangesStore } from './file-changes.store';

@Injectable({ providedIn: 'root' })
export class FileChangesQuery extends Query<FileChangesState> {

    constructor(protected store: FileChangesStore) {
        super(store);
    }

}
