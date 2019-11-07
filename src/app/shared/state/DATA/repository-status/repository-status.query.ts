import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { RepositoryStatusState, RepositoryStatusStore } from './repository-status.store';

@Injectable({ providedIn: 'root' })
export class RepositoryStatusQuery extends Query<RepositoryStatusState> {

  constructor(protected store: RepositoryStatusStore) {
    super(store);
  }

}
