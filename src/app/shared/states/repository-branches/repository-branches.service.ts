import { Injectable } from '@angular/core';
import { RepositoryBranchesStore } from './repository-branches.store';
import { RepositoryBranchSummary } from './repository-branch.model';
import { RepositoryBranchesQuery } from './repository-branches.query';
import { GitService } from '../../../services/features/git.service';
import { Account } from '../account-list';
import { fromPromise } from 'rxjs/internal-compatibility';

@Injectable({ providedIn: 'root' })
export class RepositoryBranchesService {

  constructor(
    private store: RepositoryBranchesStore,
    private query: RepositoryBranchesQuery,
    private gitService: GitService
  ) {
  }

  load(directoryGIT: string, credentials?: Account) {
    fromPromise(this.gitService.allBranches(directoryGIT, credentials)).subscribe(
      repoSummary => {
        this.refreshList(repoSummary);
      }
    );
  }

  refreshList(listBranch: RepositoryBranchSummary[]) {
    this.store.set(listBranch);
  }

  get() {
    return this.query.selectAll();
  }

  setLoading() {
    this.store.setLoading(true);
  }

  finishLoading() {
    this.store.setLoading(false);
  }
}
