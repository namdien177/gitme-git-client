import { Injectable } from '@angular/core';
import { RepositoriesStore } from './repositories.store';
import { Repository } from './repository.model';

@Injectable({ providedIn: 'root' })
export class RepositoriesService {

  constructor(protected store: RepositoriesStore) {
  }

  addNew(arr: Repository[]) {
    this.store.add(arr, { prepend: true });
  }

}
