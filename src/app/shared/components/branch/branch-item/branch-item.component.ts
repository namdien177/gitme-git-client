import { Component, Input, OnInit } from '@angular/core';
import { RepositoryBranchesService, RepositoryBranchSummary } from '../../../state/DATA/repository-branches';
import { RepositoryStatusService } from '../../../state/DATA/repository-status';
import { RepositoriesService, Repository } from '../../../state/DATA/repositories';
import { StatusSummary } from '../../../model/statusSummary.model';
import { MatBottomSheet } from '@angular/material';
import { BranchOptionsComponent } from '../_dialogs/branch-options/branch-options.component';

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
        private repositoriesService: RepositoriesService,
        private matBottomSheet: MatBottomSheet
    ) {
        this.repositoriesService.selectActive(false)
        .subscribe(repo => {
            this.repository = { ...repo } as Repository;
        });

        this.repositoryStatusService.select()
        .subscribe(status => {
            this.status = { ...status } as StatusSummary;
        });
    }

    ngOnInit() {
    }

    checkoutBranches() {
        if (!this.branchSummary.current) {
            if (this.repository && this.branchSummary && this.status.files.length === 0) {
                this.repositoryBranchService.checkoutBranch(
                    this.repository,
                    this.branchSummary
                ).subscribe(
                    status => {
                        console.log(status);
                    }
                );
            } else if (this.repository && this.status.files.length > 0) {

            }
        }

    }

    onRightClick() {
        const dataPassing = {
            branch: this.branchSummary
        };
        if (this.branchSummary.current) {
            Object.assign(dataPassing, { status: this.status });
        }
        this.matBottomSheet.open(BranchOptionsComponent, {
            panelClass: ['bg-primary-black', 'p-2-option'],
            data: dataPassing
        });
    }
}
