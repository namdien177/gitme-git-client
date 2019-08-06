import { Injectable } from '@angular/core';
import { RepositoryState, RepositoryStore } from './repository.store';
import { RepositoryQuery } from './repository.query';

@Injectable({ providedIn: 'root' })
export class RepositoryService {

  constructor(
    private repositoryStore: RepositoryStore,
    private repositoryQuery: RepositoryQuery
  ) {
  }

  setRepository(repository: RepositoryState) {
    this.repositoryStore.update(repository);
  }

  getRepository() {
    return this.repositoryQuery.getValue();
  }

  getAsync() {
    return this.repositoryQuery.select();
  }

  clear() {
    this.repositoryStore.reset();
  }
}
