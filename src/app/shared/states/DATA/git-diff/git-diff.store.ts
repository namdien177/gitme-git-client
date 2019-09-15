import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export interface GitDiffState {
    diff: string;
    name: string;
    directory: string;
    commit?: {
        original: string;
        toCompare: string
    };
}

export function createInitialState(): GitDiffState {
    return {
        diff: null,
        name: null,
        directory: null
    };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'git-diff', resettable: true })
export class GitDiffStore extends Store<GitDiffState> {

    constructor() {
        super(createInitialState());
    }

}

