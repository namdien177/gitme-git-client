import { Component, Input, OnInit } from '@angular/core';
import { RepositoryBranchesService, RepositoryBranchSummary } from '../../../state/DATA/repository-branches';
import { RepositoryStatusService } from '../../../state/DATA/repository-status';
import { RepositoriesService, Repository } from '../../../state/DATA/repositories';
import { StatusSummary } from '../../../model/statusSummary.model';

@Component({
    selector: 'gitme-branch-item',
    templateUrl: './branch-item.component.html',
    styleUrls: ['./branch-item.component.scss']
})
export class BranchItemComponent implements OnInit {

    @Input() branchSummary: RepositoryBranchSummary;
    private repository: Repository = null;
    private status: StatusSummary = null;

    constructor(
        private repositoryBranchService: RepositoryBranchesService,
        private repositoryStatusService: RepositoryStatusService,
        private repositoriesService: RepositoriesService
    ) {
        this.repositoriesService.selectActive(false)
        .subscribe(repo => {
            this.repository = repo;
        });

        this.repositoryStatusService.select()
        .subscribe(status => {
            this.status = status;
        });
    }

    ngOnInit() {
    }

    checkoutBranches() {
        if (this.repository && this.branchSummary) {
            if (this.status.files.length > 0) {
                // there is file changes
                // stop the checkout
            } else {
                this.repositoriesService.checkoutBranch(
                    this.repository,
                    this.branchSummary
                ).subscribe(
                    status => {
                        console.log(status);
                    }
                );
            }
        }
    }
}
