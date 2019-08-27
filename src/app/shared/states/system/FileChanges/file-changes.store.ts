import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export interface FileChangesState {
    isChange: boolean;
    path: string;
    type: string;
}

export function createInitialState(): FileChangesState {
    return {
        isChange: false,
        path: null,
        type: null,
    };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'FileChanges' })
export class FileChangesStore extends Store<FileChangesState> {

    constructor() {
        super(createInitialState());
    }

}

