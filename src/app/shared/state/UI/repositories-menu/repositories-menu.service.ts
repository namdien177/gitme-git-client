import { Injectable } from '@angular/core';
import { RepositoriesMenuStore } from './repositories-menu.store';
import { RepositoriesMenuQuery } from './repositories-menu.query';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class RepositoriesMenuService {

  constructor(
    private store: RepositoriesMenuStore,
    private query: RepositoriesMenuQuery,
    private router: Router
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

  select(project?) {
    return this.query.select(project);
  }

  get() {
    return this.query.getValue();
  }

  reset() {
    this.store.reset();
    this.router.navigateByUrl('/');
  }
}
