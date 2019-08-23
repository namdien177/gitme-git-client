import { Injectable } from '@angular/core';
import { RepositoriesStore } from './repositories.store';
import { Repository } from './repository.model';
import { map } from 'rxjs/operators';
import { RepositoriesQuery } from './repositories.query';

@Injectable({ providedIn: 'root' })
export class RepositoriesService {

  constructor(
    protected store: RepositoriesStore,
    protected query: RepositoriesQuery
  ) {
  }

  addNew(arr: Repository[]) {
    this.store.add(arr, { prepend: true });
  }

  selectActive(activeRepository: Repository) {
    this.store.update(activeRepository);
    // this.store.toggleActive(activeRepository);
  }

  getActive() {
    this.setLoading();
    return this.query.selectAll().pipe(
      map(
        listRepo => {
          let selected = listRepo.find(repo => repo.selected);
          if (!selected) {
            selected = listRepo[0];
            selected.selected = true;
          }
          this.finishLoading();
          return selected;
        }
      )
    );
  }

  setLoading() {
    this.store.setLoading(true);
  }

  finishLoading() {
    this.store.setLoading(false);
  }
}
