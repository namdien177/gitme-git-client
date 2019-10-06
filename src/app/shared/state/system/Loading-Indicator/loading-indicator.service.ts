import { Injectable } from '@angular/core';
import { LoadingIndicatorStore } from './loading-indicator.store';
import { LoadingIndicatorQuery } from './loading-indicator.query';

@Injectable({ providedIn: 'root' })
export class LoadingIndicatorService {

    constructor(
        private store: LoadingIndicatorStore,
        private query: LoadingIndicatorQuery,
    ) {
    }

    loadRepository() {

    }
}
