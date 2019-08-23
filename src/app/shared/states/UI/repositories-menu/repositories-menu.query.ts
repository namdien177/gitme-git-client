import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { RepositoriesMenuState, RepositoriesMenuStore } from './repositories-menu.store';

@Injectable({ providedIn: 'root' })
export class RepositoriesMenuQuery extends Query<RepositoriesMenuState> {

    constructor(protected store: RepositoriesMenuStore) {
        super(store);
    }

}
