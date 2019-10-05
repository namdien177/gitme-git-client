import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { FileWatchesState, FileWatchesStore } from './file-watches.store';

@Injectable({ providedIn: 'root' })
export class FileWatchesQuery extends Query<FileWatchesState> {

    constructor(protected store: FileWatchesStore) {
        super(store);
    }

}
