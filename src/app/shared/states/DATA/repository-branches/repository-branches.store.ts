import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { RepositoryBranchSummary } from './repository-branch.model';

export interface RepositoryBranchesState extends EntityState<RepositoryBranchSummary, string> {
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'repository-branches' })
export class RepositoryBranchesStore extends EntityStore<RepositoryBranchesState, RepositoryBranchSummary> {

    constructor() {
        super();
    }

}

