import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RepositoryBranchesService, RepositoryBranchSummary } from '../../../state/DATA/repository-branches';
import { RepositoriesService, Repository } from '../../../state/DATA/repositories';

@Component({
    selector: 'gitme-repo-branches',
    templateUrl: './list-branches.component.html',
    styleUrls: ['./list-branches.component.scss']
})
export class ListBranchesComponent implements OnInit {

    repository: Repository = null;
    branch: RepositoryBranchSummary = null;

    @Input()
    branches: RepositoryBranchSummary[] = [];

    @Output()
    branchesChange: EventEmitter<RepositoryBranchSummary[]> = new EventEmitter<RepositoryBranchSummary[]>();

    constructor(
        private repositoryBranchesService: RepositoryBranchesService,
        private repositoriesService: RepositoriesService
    ) {
        this.repository = this.repositoriesService.getActive();
        this.branch = this.repositoryBranchesService.getActive();
    }

    ngOnInit() {
    }

    openOptionNewBranch() {
        this.repositoryBranchesService.newBranchFrom(
            this.repository,
            'test-create-2',
            this.branch
        ).subscribe(result => {
            console.log(result);
        });
    }
}
