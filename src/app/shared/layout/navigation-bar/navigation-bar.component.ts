import { Component, OnInit } from '@angular/core';
import { RepositoriesMenuQuery, RepositoriesMenuService } from '../../states/repositories-menu';

@Component({
  selector: 'gitme-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent implements OnInit {
  isRepositoryBoxOpen = false;
  isBranchBoxOpen = false;

  constructor(
    private repositoriesMenuQuery: RepositoriesMenuQuery,
    private repositoriesMenuService: RepositoriesMenuService
  ) {
    this.repositoriesMenuQuery.select().subscribe(state => {
      this.isRepositoryBoxOpen = state.is_repository_open && !!state.is_available;
      this.isBranchBoxOpen = state.is_branch_open && !!state.is_available;
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
