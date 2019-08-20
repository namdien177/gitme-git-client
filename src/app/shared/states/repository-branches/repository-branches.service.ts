import { Injectable } from '@angular/core';
import { RepositoryBranchesStore } from './repository-branches.store';
import { RepositoryBranchSummary } from './repository-branch.model';
import { RepositoryBranchesQuery } from './repository-branches.query';

@Injectable({ providedIn: 'root' })
export class RepositoryBranchesService {

  constructor(
    private repositoryBranchesStore: RepositoryBranchesStore,
    private repositoryBranchesQuery: RepositoryBranchesQuery
  ) {
  }

  refreshList(listBranch: RepositoryBranchSummary[]) {
    this.repositoryBranchesStore.set(listBranch);
  }

  get() {
    return this.repositoryBranchesQuery.selectAll();
  }
}
