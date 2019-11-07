import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { GitDiffResult } from '../../../model/gitDiff.model';

export interface GitDiffState {
  diff: GitDiffResult;
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

