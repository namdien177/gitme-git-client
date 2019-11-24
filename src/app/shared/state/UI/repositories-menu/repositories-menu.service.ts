import { Injectable } from '@angular/core';
import { RepositoriesMenuStore } from './repositories-menu.store';
import { RepositoriesMenuQuery } from './repositories-menu.query';

@Injectable({ providedIn: 'root' })
export class RepositoriesMenuService {

  constructor(
    private store: RepositoriesMenuStore,
    private query: RepositoriesMenuQuery
  ) {
  }

  viewCommitMenu(value: 'history' | 'changes') {
    this.store.update({
      commit_view: value
    });
  }

  openRepoMenu() {
    this.store.update({
      is_repository_open: true,
      is_branch_open: false
    });
  }

  closeRepoMenu() {
    this.store.update({
      is_repository_open: false,
      is_branch_open: false
    });
  }

  toggleRepositoryMenu(status: boolean) {
    if (status) {
      this.closeRepoMenu();
    } else {
      this.openRepoMenu();
    }
  }

  openBranchMenu() {
    this.store.update({
      is_branch_open: true,
      is_repository_open: false,
    });
  }

  closeBranchMenu() {
    this.store.update({
      is_branch_open: false,
      is_repository_open: false,
    });
  }

  toggleBranchMenu(status: boolean) {
    if (status) {
      this.closeBranchMenu();
    } else {
      this.openBranchMenu();
    }
  }

  openRepositoryCloneDialog() {
    const currentRepoOpen = this.query.getValue().is_repository_open;
    if (currentRepoOpen) {
      this.store.update({
        is_repository_clone_open: true
      });
    }
  }

  closeRepositoryCloneDialog() {
    const currentRepoOpen = this.query.getValue().is_repository_open;
    if (currentRepoOpen) {
      this.store.update({
        is_repository_clone_open: false
      });
    }
  }

  openRepositoryAddLocalDialog() {
    const currentRepoOpen = this.query.getValue().is_repository_open;

    if (currentRepoOpen) {
      this.store.update({
        is_repository_addLocal_open: true
      });
    }
  }

  closeRepositoryAddLocalDialog() {
    const currentRepoOpen = this.query.getValue().is_repository_open;

    if (currentRepoOpen) {
      this.store.update({
        is_repository_addLocal_open: false
      });
    }
  }

  select(project?) {
    return this.query.select(project);
  }

  get() {
    return this.query.getValue();
  }
}
