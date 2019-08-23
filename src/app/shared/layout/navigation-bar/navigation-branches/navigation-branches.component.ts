import { Component, OnInit } from '@angular/core';
import { RepositoryBranchesQuery, RepositoryBranchesService, RepositoryBranchSummary } from '../../../states/DATA/repository-branches';
import { Observable } from 'rxjs';

@Component({
    selector: 'gitme-repo-branches',
    templateUrl: './navigation-branches.component.html',
    styleUrls: ['./navigation-branches.component.scss']
})
export class NavigationBranchesComponent implements OnInit {

    branches: Observable<RepositoryBranchSummary[]>;

    constructor(
        private repositoryBranchesService: RepositoryBranchesService,
        private repositoriesBranchesQuery: RepositoryBranchesQuery
    ) {
        this.branches = this.repositoriesBranchesQuery.selectAll();
    }

    ngOnInit() {
    }

}
