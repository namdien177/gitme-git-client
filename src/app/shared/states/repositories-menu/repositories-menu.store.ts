import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export interface RepositoriesMenuState {
  is_open: boolean;
  repo?: {
    id: string,
    provider: string,
  };
}

export function createInitialState(): RepositoriesMenuState {
  return {
    is_open: true
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'repositories-menu' })
export class RepositoriesMenuStore extends Store<RepositoriesMenuState> {

  constructor() {
    super(createInitialState());
  }

}

