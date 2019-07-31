import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { Repository } from './repository.model';

export interface RepositoriesState extends EntityState<Repository> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'repositories' })
export class RepositoriesStore extends EntityStore<RepositoriesState> {

  constructor() {
    super();
  }

}

