import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { RepositoryStore } from './repository.store';
import { Repository } from '../repositories';

@Injectable({ providedIn: 'root' })
export class RepositoryQuery extends Query<Repository> {

    constructor(protected store: RepositoryStore) {
        super(store);
    }

}
