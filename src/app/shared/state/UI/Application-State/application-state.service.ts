import { Injectable } from '@angular/core';
import { ApplicationStateStore } from './application-state.store';
import { ApplicationStateQuery } from './application-state.query';

@Injectable({ providedIn: 'root' })
export class ApplicationStateService {

    constructor(
        private applicationStateStore: ApplicationStateStore,
        private applicationStateQuery: ApplicationStateQuery
    ) {
    }

    setBlur() {
        this.applicationStateStore.update({ isLosingFocus: true });
    }

    setFocus() {
        this.applicationStateStore.update({ isLosingFocus: false });
    }

    observeApplicationState() {
        return this.applicationStateQuery.select();
    }

    getApplicationState() {
        return this.applicationStateQuery.getValue();
    }
}
