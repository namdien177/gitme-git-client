import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { Repository } from '../repositories';

export function createInitialState(): Repository {
  return {
    id: null,
    id_remote: null,
    name: null,
    directory: null,
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'repository', resettable: true })
export class RepositoryStore extends Store<Repository> {

  constructor() {
    super(createInitialState());
  }

}

