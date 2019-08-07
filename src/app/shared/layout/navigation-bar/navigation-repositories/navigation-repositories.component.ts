import { Component, OnInit } from '@angular/core';
import { RepositoriesMenuQuery } from '../../../states/repositories-menu';
import { RepositoriesQuery, RepositoriesState } from '../../../states/repositories';
import { RepositoryQuery, RepositoryService, RepositoryState } from '../../../states/repository';

@Component({
  selector: 'gitme-navigation-repositories',
  templateUrl: './navigation-repositories.component.html',
  styleUrls: ['./navigation-repositories.component.scss']
})
export class NavigationRepositoriesComponent implements OnInit {

  repositories: RepositoriesState = [];
  isAddRepositoryDialogOn = true;

  constructor(
    private repositoriesQuery: RepositoriesQuery,
    private repoMenu: RepositoriesMenuQuery,
    private repositoryQuery: RepositoryQuery,
    private repositoryService: RepositoryService,
  ) {
  }

  ngOnInit() {
    this.repoMenu.select().subscribe(e => {
      console.log(e);
    });

    this.repositoriesQuery.selectAll().pipe().subscribe(listRepos => {
      this.repositories = listRepos;
    });
  }

  addRepositoryDialogOn() {
    this.isAddRepositoryDialogOn = true;
  }

  addRepositoryDialogListener(closeStatus: { repository: RepositoryState; cancel: boolean }) {
    if (closeStatus.cancel) {
      this.isAddRepositoryDialogOn = false;
      return;
    }
    console.log(closeStatus);
  }
}
