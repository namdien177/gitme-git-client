import { Injectable } from '@angular/core';
import { RepositoriesMenuStore } from './repositories-menu.store';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class RepositoriesMenuService {

  constructor(private repositoriesMenuStore: RepositoriesMenuStore,
              private http: HttpClient) {
  }

  get() {
    return this.http.get('').pipe(tap(entities => this.repositoriesMenuStore.update(entities)));
  }

  openRepoMenu() {
    this.repositoriesMenuStore.update({
      is_open: true
    });
  }

  closeRepoMenu() {
    this.repositoriesMenuStore.update({
      is_open: false
    });
  }

  selectRepo(repo_id, repo_provider) {
    this.repositoriesMenuStore.update({
      repo: {
        id: repo_id,
        provider: repo_provider
      }
    });
  }
}
