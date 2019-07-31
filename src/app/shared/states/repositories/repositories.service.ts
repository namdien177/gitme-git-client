import { Injectable } from '@angular/core';
import { RepositoriesStore, RepositoriesState } from './repositories.store';
import { NgEntityService } from '@datorama/akita-ng-entity-service';

@Injectable({ providedIn: 'root' })
export class RepositoriesService extends NgEntityService<RepositoriesState> {

  constructor(protected store: RepositoriesStore) {
    super(store);
  }

}
