import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { StatusSummary } from '../../../model/statusSummary.model';
import { FileStatusSummary } from '../../../model/FileStatusSummary';

export interface RepositoryStatusState extends StatusSummary {
  ahead: number;
  behind: number;
  conflicted: any[];
  created: string[];
  current: string;
  deleted: any[];
  files: FileStatusSummaryView[];
  modified: string[];
  not_added: string[];
  renamed: any[];
  staged: any[];
  tracking: string;
}

export interface FileStatusSummaryView extends FileStatusSummary {
  checked: boolean;
  active: boolean;
}

export function createInitialState(): RepositoryStatusState {
  return {
    ahead: 0,
    behind: 0,
    conflicted: [],
    created: [],
    current: null,
    deleted: [],
    files: [],
    modified: [],
    not_added: [],
    renamed: [],
    staged: [],
    tracking: null,
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'repository-status' })
export class RepositoryStatusStore extends Store<RepositoryStatusState> {

  constructor() {
    super(createInitialState());
  }

}

