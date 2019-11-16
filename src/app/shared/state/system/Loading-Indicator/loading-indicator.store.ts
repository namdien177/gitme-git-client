import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export interface LoadingIndicatorState {
  load: boolean;
  note: string;
}

export function createInitialState(): LoadingIndicatorState {
  return {
    load: false,
    note: '',
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'Loading-Indicator', resettable: true })
export class LoadingIndicatorStore extends Store<LoadingIndicatorState> {

  constructor() {
    super(createInitialState());
  }

}

