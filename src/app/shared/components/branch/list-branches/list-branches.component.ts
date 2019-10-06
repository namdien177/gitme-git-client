import { Component, OnInit } from '@angular/core';
import { RepositoryBranchesService, RepositoryBranchSummary } from '../../../state/DATA/repository-branches';
import { Observable } from 'rxjs';

@Component({
    selector: 'gitme-repo-branches',
    templateUrl: './list-branches.component.html',
    styleUrls: ['./list-branches.component.scss']
})
export class ListBranchesComponent implements OnInit {

    branches: Observable<RepositoryBranchSummary[]>;

    constructor(
        private repositoryBranchesService: RepositoryBranchesService,
    ) {
        this.branches = this.repositoryBranchesService.get();
    }

    ngOnInit() {
    }

}
