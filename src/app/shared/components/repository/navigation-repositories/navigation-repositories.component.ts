import { Component, OnInit } from '@angular/core';
import { RepositoriesService, Repository } from '../../../state/DATA/repositories';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'gitme-navigation-repositories',
  templateUrl: './navigation-repositories.component.html',
  styleUrls: ['./navigation-repositories.component.scss'],
})
export class NavigationRepositoriesComponent implements OnInit {

  /**
   * List of all repository within the system
   */
  repositories: Observable<Repository[]>;
  isAddRepositoryActionOn = false;

  constructor(
    private repositoriesService: RepositoriesService,
    private router: Router,
  ) {
  }

  ngOnInit() {
    // Retrieve all repositories on local
    this.repositories = this.repositoriesService.selectAll();
  }

  cloneRepositoryDialogOn() {
    this.isAddRepositoryActionOn = false;
    this.router.navigateByUrl('application/import-https');
  }

  addRepositoryDialog() {
    this.isAddRepositoryActionOn = false;
    this.router.navigateByUrl('application/import-local');
  }

  trackBy(index, item: Repository) {
    return item.id;
  }
}
