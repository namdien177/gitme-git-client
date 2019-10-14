import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { LoadingIndicatorStore, LoadingIndicatorState } from './loading-indicator.store';

@Injectable({ providedIn: 'root' })
export class LoadingIndicatorQuery extends Query<LoadingIndicatorState> {

  constructor(protected store: LoadingIndicatorStore) {
    super(store);
  }

}
