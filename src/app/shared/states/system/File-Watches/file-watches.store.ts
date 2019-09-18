import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export interface FileWatchesState {
    isChange: boolean;
    path: string;
    type: string;
}

export function createInitialState(): FileWatchesState {
    return {
        isChange: false,
        path: null,
        type: null,
    };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'FileWatches' })
export class FileWatchesStore extends Store<FileWatchesState> {

    constructor() {
        super(createInitialState());
    }

}

