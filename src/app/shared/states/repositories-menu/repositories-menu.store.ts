import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';

export interface RepositoriesMenuState {
  is_available: boolean;
  is_repository_open: boolean;
  is_repository_add_open: boolean;
  is_branch_open: boolean;
  repo?: {
    id: string,
    provider: string,
  };
}

export function createInitialState(): RepositoriesMenuState {
  return {
    is_available: true,
    is_repository_open: false,
    is_repository_add_open: false,
    is_branch_open: false
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'repositories-menu' })
export class RepositoriesMenuStore extends Store<RepositoriesMenuState> {

  constructor() {
    super(createInitialState());
  }

}

