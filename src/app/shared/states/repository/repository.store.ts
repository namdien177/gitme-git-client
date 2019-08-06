import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export interface RepositoryState {
  key: string;
}

export function createInitialState(): RepositoryState {
  return {
    key: null
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'repository', resettable: true })
export class RepositoryStore extends Store<RepositoryState> {

  constructor() {
    super(createInitialState());
  }

}

