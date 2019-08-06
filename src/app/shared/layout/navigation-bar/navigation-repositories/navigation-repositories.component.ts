import { Component, OnInit } from '@angular/core';
import { RepositoriesMenuQuery } from '../../../states/repositories-menu';
import { RepositoriesQuery, RepositoriesState } from '../../../states/repositories';

@Component({
  selector: 'gitme-navigation-repositories',
  templateUrl: './navigation-repositories.component.html',
  styleUrls: ['./navigation-repositories.component.scss']
})
export class NavigationRepositoriesComponent implements OnInit {

  repositories: RepositoriesState = [];

  constructor(
    private repositoryQuery: RepositoriesQuery,
    private repoMenu: RepositoriesMenuQuery
  ) {
  }

  ngOnInit() {
    this.repoMenu.select().subscribe(e => {
      console.log(e);
    });

    this.repositoryQuery.selectAll().pipe().subscribe(listRepos => {
      this.repositories = listRepos;
      console.log(listRepos);
    })
  }

}
