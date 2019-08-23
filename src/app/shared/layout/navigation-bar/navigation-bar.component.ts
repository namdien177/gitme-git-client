import { Component, OnInit } from '@angular/core';
import { RepositoriesMenuQuery, RepositoriesMenuService } from '../../states/UI/repositories-menu';
import { RepositoriesQuery, RepositoriesService, Repository } from '../../states/DATA/repositories';
import { RepositoryBranchesQuery, RepositoryBranchesService, RepositoryBranchSummary } from '../../states/DATA/repository-branches';

@Component({
    selector: 'gitme-navigation-bar',
    templateUrl: './navigation-bar.component.html',
    styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent implements OnInit {
    isRepositoryBoxOpen = false;
    isBranchBoxOpen = false;

    activeRepository: Repository = null;
    activeBranch: RepositoryBranchSummary = null;

    constructor(
        private repositoriesMenuQuery: RepositoriesMenuQuery,
        private repositoriesMenuService: RepositoriesMenuService,
        protected repositoriesQuery: RepositoriesQuery,
        protected branchesQuery: RepositoryBranchesQuery,
        private repositoriesService: RepositoriesService,
        private branchesService: RepositoryBranchesService
    ) {
        // State UI
        this.repositoriesMenuQuery.select().subscribe(state => {
            this.isRepositoryBoxOpen = state.is_repository_open && !!state.is_available;
            this.isBranchBoxOpen = state.is_branch_open && !!state.is_available;
        });

        // Retrieve current selected repository
        this.repositoriesService.getActiveRepository().subscribe(
            selectedRepo => {
                this.activeRepository = selectedRepo;
                this.branchesService.load(selectedRepo.directory, null);
            }
        );

        this.branchesQuery.selectAll().subscribe(listBranch => {
            this.activeBranch = listBranch.find(branch => {
                return branch.current || branch.current === 'true';
            });
            console.log(listBranch);
        });
    }

    ngOnInit() {

    }

    toggleRepositoryBox() {
        if (this.isRepositoryBoxOpen) {
            this.repositoriesMenuService.closeRepoMenu();
        } else {
            this.repositoriesMenuService.openRepoMenu();
        }
    }

    toggleBranchBox() {
        if (this.isBranchBoxOpen) {
            this.repositoriesMenuService.closeBranchMenu();
        } else {
            this.repositoriesMenuService.openBranchMenu();
        }
    }

    clickOutSide(isOutSide: boolean, button: 'repositories' | 'branches') {
        if (isOutSide) {
            switch (button) {
                case 'branches':
                    if (this.isBranchBoxOpen) {
                        this.repositoriesMenuService.closeBranchMenu();
                    }
                    break;
                case 'repositories':
                    if (this.isRepositoryBoxOpen) {
                        this.repositoriesMenuService.closeRepoMenu();
                    }
                    break;
            }
        }
    }
}
