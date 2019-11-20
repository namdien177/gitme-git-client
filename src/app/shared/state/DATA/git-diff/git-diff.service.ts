import { Injectable } from '@angular/core';
import { createInitialState, diffChangeStatus, GitDiffState, GitDiffStore } from './git-diff.store';
import { GitDiffQuery } from './git-diff.query';
import { CodeHighlightService } from '../../../../services/features/code-highlight.service';
import { Observable } from 'rxjs';
import { GitDiffResult } from '../../../model/gitDiff.model';

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
    status: diffChangeStatus = 'change'
  ) {
    this.store.setLoading(true);
    let diffState: GitDiffResult = null;
    if (!!diff && diff.length > 0) {
      diffState = await this.codeHighLightService.getDiffHTML(diff);
    } else {
      diffState = createInitialState().diff;
      status = 'new';
    }

    this.store.setLoading(false);
    this.store.update({
      diff: diffState,
      directory: fileDirectory,
      status
    });

    return diffState;
  }

  setOversizeFile() {
    this.store.reset();
    this.store.update({
      overflow: true
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
