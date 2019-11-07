import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { GitDiffState, GitDiffStore } from './git-diff.store';

@Injectable({ providedIn: 'root' })
export class GitDiffQuery extends Query<GitDiffState> {

  constructor(protected store: GitDiffStore) {
    super(store);
  }

}
