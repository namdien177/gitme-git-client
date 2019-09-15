import { Injectable } from '@angular/core';
import { GitDiffStore } from './git-diff.store';
import { GitDiffQuery } from './git-diff.query';

@Injectable({ providedIn: 'root' })
export class GitDiffService {

    constructor(
        private gitDiffStore: GitDiffStore,
        private query: GitDiffQuery
    ) {
    }

    setDiff(diff: string, fileName: string, fileDirectory: string) {
        this.gitDiffStore.update({
            diff
        });
    }

    getDiff() {
        return this.query.select();
    }

    getDiffSync() {
        return this.query.getValue();
    }

    reset() {
        this.gitDiffStore.reset();
    }
}
