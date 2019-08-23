import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { RepositoriesState, RepositoriesStore } from './repositories.store';

@Injectable({ providedIn: 'root' })
export class RepositoriesQuery extends QueryEntity<RepositoriesState> {

    constructor(protected store: RepositoriesStore) {
        super(store);
    }

}
