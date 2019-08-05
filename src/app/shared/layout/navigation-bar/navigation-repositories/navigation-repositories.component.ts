import { Component, OnInit } from '@angular/core';
import { RepositoriesMenuQuery } from '../../../states/repositories-menu';

@Component({
  selector: 'gitme-navigation-repositories',
  templateUrl: './navigation-repositories.component.html',
  styleUrls: ['./navigation-repositories.component.scss']
})
export class NavigationRepositoriesComponent implements OnInit {

  // repositories: Observable<RepositoriesState>;

  constructor(
    // private repositoryQuery: RepositoriesQuery
    private repoMenu: RepositoriesMenuQuery
  ) {
  }

  ngOnInit() {
    this.repoMenu.select().subscribe(e => {
      console.log(e);
    });
  }

}
