import { Component, OnInit } from '@angular/core';
import { RepositoriesMenuQuery, RepositoriesMenuService } from '../../../states/UI/repositories-menu';
import { RepositoriesQuery, Repository } from '../../../states/DATA/repositories';
import { Observable } from 'rxjs';

@Component({
    selector: 'gitme-navigation-repositories',
    templateUrl: './navigation-repositories.component.html',
    styleUrls: ['./navigation-repositories.component.scss']
})
export class NavigationRepositoriesComponent implements OnInit {

    /**
     * List of all repository within the system
     */
    repositories: Observable<Repository[]>;
    isAddRepositoryActionOn = false;
    isCloneRepositoryDialogOn: Observable<boolean>;
    isAddRepositoryDialogOn: Observable<boolean>;

    constructor(
        private repositoriesQuery: RepositoriesQuery,
        private repositoriesMenuQuery: RepositoriesMenuQuery,
        private repositoriesMenuService: RepositoriesMenuService,
    ) {
    }

    ngOnInit() {
        // Retrieve all repositories on local
        this.repositories = this.repositoriesQuery.selectAll();
        // get state of cloning dialog
        this.isCloneRepositoryDialogOn = this.repositoriesMenuQuery.select(
            status => status.is_repository_clone_open
        );
        // get state of adding dialog
        this.isAddRepositoryDialogOn = this.repositoriesMenuQuery.select(
            status => status.is_repository_addLocal_open
        );


    }

    cloneRepositoryDialogOn() {
        this.isAddRepositoryActionOn = false;
        this.repositoriesMenuService.openRepositoryCloneDialog();
    }

    addRepositoryDialog() {
        this.isAddRepositoryActionOn = false;
        this.repositoriesMenuService.openRepositoryAddLocalDialog();
    }

    trackBy(index, item: Repository) {
        return item.id;
    }
}
