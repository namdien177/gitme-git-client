import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { ApplicationStateState, ApplicationStateStore } from './application-state.store';

@Injectable({ providedIn: 'root' })
export class ApplicationStateQuery extends Query<ApplicationStateState> {

    constructor(protected store: ApplicationStateStore) {
        super(store);
    }

}
