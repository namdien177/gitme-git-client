import { Injectable } from '@angular/core';
import { RepositoryStore } from './repository.store';
import { RepositoryQuery } from './repository.query';
import { Repository } from '../repositories';

@Injectable({ providedIn: 'root' })
export class RepositoryService {

    constructor(
        private repositoryStore: RepositoryStore,
        private repositoryQuery: RepositoryQuery
    ) {
    }

    setRepository(repository: Repository) {
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
