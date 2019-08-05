import { Injectable } from '@angular/core';
import { RepositoriesMenuStore } from './repositories-menu.store';

@Injectable({ providedIn: 'root' })
export class RepositoriesMenuService {

  constructor(
    private repositoriesMenuStore: RepositoriesMenuStore
  ) {
  }

  openRepoMenu() {
    this.repositoriesMenuStore.update({
      is_repository_open: true,
      is_branch_open: false
    });
  }

  closeRepoMenu() {
    this.repositoriesMenuStore.update({
      is_repository_open: false,
      is_branch_open: false
    });
  }

  openBranchMenu() {
    this.repositoriesMenuStore.update({
      is_branch_open: true,
      is_repository_open: false,
    });
  }

  closeBranchMenu() {
    this.repositoriesMenuStore.update({
      is_branch_open: false,
      is_repository_open: false,
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
