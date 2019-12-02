import { Injectable } from '@angular/core';
import { ApplicationStateStore } from './application-state.store';
import { ApplicationStateQuery } from './application-state.query';

@Injectable({ providedIn: 'root' })
export class ApplicationStateService {

  constructor(
    private store: ApplicationStateStore,
    private query: ApplicationStateQuery
  ) {
  }

  setBlur() {
    this.store.update({ isLosingFocus: true });
  }

  setFocus() {
    this.store.update({ isLosingFocus: false });
  }

  observeApplicationState() {
    return this.query.select();
  }

  getApplicationState() {
    return this.query.getValue();
  }

  setCheckingAuthorize() {
    this.store.update({ isCheckingAuthorize: true });
  }

  setFinishCheckAuthorize() {
    this.store.update({ isCheckingAuthorize: false });
  }

}
