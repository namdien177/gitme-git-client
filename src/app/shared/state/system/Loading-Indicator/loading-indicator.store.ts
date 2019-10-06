import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export interface LoadingIndicatorState {
    repository: boolean;
    branch: boolean;
    fetch: boolean;
    push: boolean;
    pull: boolean;
}

export function createInitialState(): LoadingIndicatorState {
    return {
        repository: false,
        branch: false,
        fetch: false,
        push: false,
        pull: false
    };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'Loading-Indicator' })
export class LoadingIndicatorStore extends Store<LoadingIndicatorState> {

    constructor() {
        super(createInitialState());
    }

}

