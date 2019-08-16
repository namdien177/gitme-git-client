import { Component, OnInit } from '@angular/core';
import { RepositoriesMenuQuery, RepositoriesMenuService } from '../../../states/repositories-menu';
import { RepositoriesQuery, RepositoriesState } from '../../../states/repositories';
import { RepositoryQuery, RepositoryService } from '../../../states/repository';
import { Observable } from 'rxjs';

@Component({
  selector: 'gitme-navigation-repositories',
  templateUrl: './navigation-repositories.component.html',
  styleUrls: ['./navigation-repositories.component.scss']
})
export class NavigationRepositoriesComponent implements OnInit {

  repositories: RepositoriesState = [];
  isAddRepositoryActionOn = false;
  isCloneRepositoryDialogOn: Observable<boolean>;
  isAddRepositoryDialogOn: Observable<boolean>;

  constructor(
    private repositoriesQuery: RepositoriesQuery,
    private repositoriesMenuQuery: RepositoriesMenuQuery,
    private repositoriesMenuService: RepositoriesMenuService,
    private repositoryQuery: RepositoryQuery,
    private repositoryService: RepositoryService,
  ) {
  }

  ngOnInit() {
    this.repositoryQuery.select().subscribe(e => {
      console.log(e);
    });

    this.isCloneRepositoryDialogOn = this.repositoriesMenuQuery.select(status => status.is_repository_clone_open);
    this.isAddRepositoryDialogOn = this.repositoriesMenuQuery.select(status => status.is_repository_addLocal_open);

    this.repositoriesQuery.selectAll().pipe().subscribe(listRepos => {
      this.repositories = listRepos;
    });
  }

  cloneRepositoryDialogOn() {
    this.isAddRepositoryActionOn = false;
    this.repositoriesMenuService.openRepositoryCloneDialog();
  }

  addRepositoryDialog() {
    this.isAddRepositoryActionOn = false;
    this.repositoriesMenuService.openRepositoryAddLocalDialog();
  }
}
