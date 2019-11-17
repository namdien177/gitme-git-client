import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { RepositoryBranchesState, RepositoryBranchesStore } from './repository-branches.store';

@Injectable({ providedIn: 'root' })
export class RepositoryBranchesQuery extends QueryEntity<RepositoryBranchesState> {

  constructor(protected store: RepositoryBranchesStore) {
    super(store);
  }

}
