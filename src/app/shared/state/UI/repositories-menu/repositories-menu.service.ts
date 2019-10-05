import { Injectable } from '@angular/core';
import { RepositoriesMenuStore } from './repositories-menu.store';
import { RepositoriesMenuQuery } from './repositories-menu.query';

@Injectable({ providedIn: 'root' })
export class RepositoriesMenuService {

    constructor(
        private repositoriesMenuStore: RepositoriesMenuStore,
        private repositoryMenuQuery: RepositoriesMenuQuery
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

    toggleRepositoryMenu(status: boolean) {
        if (status) {
            this.closeRepoMenu();
        } else {
            this.openRepoMenu();
        }
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

    toggleBranchMenu(status: boolean) {
        if (status) {
            this.closeBranchMenu();
        } else {
            this.openBranchMenu();
        }
    }

    openRepositoryCloneDialog() {
        const currentRepoOpen = this.repositoryMenuQuery.getValue().is_repository_open;
        if (currentRepoOpen) {
            this.repositoriesMenuStore.update({
                is_repository_clone_open: true
            });
        }
    }

    closeRepositoryCloneDialog() {
        const currentRepoOpen = this.repositoryMenuQuery.getValue().is_repository_open;
        if (currentRepoOpen) {
            this.repositoriesMenuStore.update({
                is_repository_clone_open: false
            });
        }
    }

    openRepositoryAddLocalDialog() {
        const currentRepoOpen = this.repositoryMenuQuery.getValue().is_repository_open;

        if (currentRepoOpen) {
            this.repositoriesMenuStore.update({
                is_repository_addLocal_open: true
            });
        }
    }

    closeRepositoryAddLocalDialog() {
        const currentRepoOpen = this.repositoryMenuQuery.getValue().is_repository_open;

        if (currentRepoOpen) {
            this.repositoriesMenuStore.update({
                is_repository_addLocal_open: false
            });
        }
    }

    select() {
        return this.repositoryMenuQuery.select();
    }
}
