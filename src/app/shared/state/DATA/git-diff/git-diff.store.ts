import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { GitDiff } from '../../../model/gitDiff.model';

export interface GitDiffState {
    diff: GitDiff;
    directory: string;
    status: 'change' | 'new' | 'delete';
    commit?: {
        original: string;
        toCompare: string
    };
    overflow: boolean;
}

export function createInitialState(): GitDiffState {
    return {
        diff: null,
        directory: null,
        status: null,
        overflow: false
    };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'git-diff', resettable: true })
export class GitDiffStore extends Store<GitDiffState> {

    constructor() {
        super(createInitialState());
    }

}

