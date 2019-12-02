import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export interface ApplicationStateState {
  isLosingFocus: boolean;
  isCheckingAuthorize: boolean;
}

export function createInitialState(): ApplicationStateState {
  return {
    isLosingFocus: false,
    isCheckingAuthorize: false
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'Application-state' })
export class ApplicationStateStore extends Store<ApplicationStateState> {

  constructor() {
    super(createInitialState());
  }

}

