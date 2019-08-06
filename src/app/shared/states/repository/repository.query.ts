import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { RepositoryStore, RepositoryState } from './repository.store';

@Injectable({ providedIn: 'root' })
export class RepositoryQuery extends Query<RepositoryState> {

  constructor(protected store: RepositoryStore) {
    super(store);
  }

}
