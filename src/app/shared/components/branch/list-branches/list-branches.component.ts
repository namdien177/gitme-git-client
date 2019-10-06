import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RepositoryBranchesService, RepositoryBranchSummary } from '../../../state/DATA/repository-branches';

@Component({
    selector: 'gitme-repo-branches',
    templateUrl: './list-branches.component.html',
    styleUrls: ['./list-branches.component.scss']
})
export class ListBranchesComponent implements OnInit {


    @Input()
    branches: RepositoryBranchSummary[] = [];

    @Output()
    branchesChange: EventEmitter<RepositoryBranchSummary[]> = new EventEmitter<RepositoryBranchSummary[]>();

    constructor(
        private repositoryBranchesService: RepositoryBranchesService,
    ) {
    }

    ngOnInit() {
    }

}
