import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RepositoryBranchesService, RepositoryBranchSummary } from '../../../state/DATA/repository-branches';
import { RepositoriesService, Repository } from '../../../state/DATA/repositories';
import { MatDialog } from '@angular/material';
import { BranchNewOptionComponent } from '../_dialogs/branch-new/branch-new-option/branch-new-option.component';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { YesNoDialogModel } from '../../../model/yesNoDialog.model';

@Component({
    selector: 'gitme-repo-branches',
    templateUrl: './list-branches.component.html',
    styleUrls: ['./list-branches.component.scss']
})
export class ListBranchesComponent implements OnInit, AfterViewInit {

    repository: Repository = null;
    branch: RepositoryBranchSummary = null;

    @Input()
    branches: RepositoryBranchSummary[] = [];
    @Output()
    branchesChange: EventEmitter<RepositoryBranchSummary[]> = new EventEmitter();

    constructor(
        private repositoryBranchesService: RepositoryBranchesService,
        private repositoriesService: RepositoriesService,
        private matDialog: MatDialog
    ) {
        this.repository = this.repositoriesService.getActive();
        this.branch = this.repositoryBranchesService.getActive();
    }

    ngAfterViewInit(): void {
        this.openOptionNewBranch();
    }

    ngOnInit() {

    }

    openOptionNewBranch() {
        const data: YesNoDialogModel = {
            title: 'New Branch',
            body: null,
            data: {
                repository: this.repository,
                branch: this.branch
            },
            decision: {
                noText: 'Cancel',
                yesText: 'Create'
            }
        };
        const dialogOpenInitial = this.matDialog.open(
            BranchNewOptionComponent, {
                width: '380px',
                height: 'auto',
                data: data,
                panelClass: 'bg-primary-black-mat-dialog',
            }
        );

        dialogOpenInitial.afterClosed().pipe(
            switchMap(newBranch => {
                if (newBranch) {
                    // Did return new branch info
                }
                console.log(newBranch);

                return of(null);
            })
        ).subscribe(final => {
            console.log(final);
        });

        // this.repositoryBranchesService.newBranchFrom(
        //     this.repository,
        //     'test-create-2',
        //     this.branch
        // ).subscribe(result => {
        //     console.log(result);
        // });
    }
}
