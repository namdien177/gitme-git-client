import { Injectable } from '@angular/core';
import { ActiveState, EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { Repository } from './repository.model';

export interface RepositoriesState extends EntityState<Repository>, ActiveState {
}

const initialState = {
    active: null
};

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'repositories', resettable: true })
export class RepositoriesStore extends EntityStore<RepositoriesState> {

    constructor() {
        super(initialState);
    }

}

