import { Component, OnInit } from '@angular/core';
import { RepositoryBranchesService, RepositoryBranchSummary } from '../../../states/DATA/repository-branches';
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
    ) {
        this.branches = this.repositoryBranchesService.get();
    }

    ngOnInit() {
    }

}
