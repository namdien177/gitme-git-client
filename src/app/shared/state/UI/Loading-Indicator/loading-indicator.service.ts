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

  setLoading(note?: string) {
    this.store.update({
      load: true,
      note
    });
  }

  setFinish() {
    this.store.reset();
  }

  observeLoadState() {
    return this.query.select();
  }

  getLoadState() {
    return this.query.getValue();
  }
}

