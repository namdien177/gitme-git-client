import { Injectable } from '@angular/core';
import { GitDiffState, GitDiffStore } from './git-diff.store';
import { GitDiffQuery } from './git-diff.query';
import { CodeHighlightService } from '../../../../services/features/code-highlight.service';
import { Observable } from 'rxjs';
import { GitDiff } from '../../../model/GitDiff';

@Injectable({ providedIn: 'root' })
export class GitDiffService {

    constructor(
        private store: GitDiffStore,
        private query: GitDiffQuery,
        private codeHighLightService: CodeHighlightService
    ) {
    }

    async setDiff(
        diff: string,
        fileDirectory: string,
        status: 'change' | 'new' | 'delete' = 'change'
    ) {
        this.store.setLoading(true);
        let diffState: GitDiff = null;
        console.log(diff);
        if (!!diff && diff.length > 0) {
            diffState = await this.codeHighLightService.getDiffHTML(diff);
        }
        console.log(diffState);
        this.store.setLoading(false);
        this.store.update({
            diff: diffState,
            directory: fileDirectory,
            status
        });
    }

    getDiff(): Observable<GitDiffState> {
        return this.query.select();
    }

    getDiffSync() {
        return this.query.getValue();
    }

    reset() {
        this.store.reset();
    }
}
