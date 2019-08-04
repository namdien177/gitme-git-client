import { Component, OnInit } from '@angular/core';
import { RepositoriesMenuQuery, RepositoriesMenuService } from '../../states/repositories-menu';

@Component({
  selector: 'gitme-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss']
})
export class NavigationBarComponent implements OnInit {
  isSidebarOpen = false;

  constructor(
    private repositoriesMenuQuery: RepositoriesMenuQuery,
    private repositoriesMenuService: RepositoriesMenuService
  ) {
    this.repositoriesMenuQuery.select().subscribe(state => {
      console.log(state);
      this.isSidebarOpen = state.is_open && !!state.is_available;
    });
  }

  ngOnInit() {
  }

  toggleSideBar() {
    if (this.isSidebarOpen) {
      this.repositoriesMenuService.closeRepoMenu();
    } else {
      this.repositoriesMenuService.openRepoMenu();
    }
  }
}
