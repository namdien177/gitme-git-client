import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { GitDiff } from '../../../model/GitDiff';

export interface GitDiffState {
    diff: GitDiff;
    directory: string;
    commit?: {
        original: string;
        toCompare: string
    };
}

export function createInitialState(): GitDiffState {
    return {
        diff: null,
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

