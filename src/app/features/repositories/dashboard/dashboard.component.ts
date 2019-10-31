import { Component, OnDestroy, OnInit } from '@angular/core';
import { GitDiffService, GitDiffState } from '../../../shared/state/DATA/git-diff';
import { UtilityService } from '../../../shared/utilities/utility.service';
import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { RepositoryStatusService } from '../../../shared/state/DATA/repository-status';
import { StatusSummary } from '../../../shared/model/statusSummary.model';

@Component({
    selector: 'gitme-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

    diffStatus: GitDiffState = null;

    statusSummary: StatusSummary = null;

    info: {
        dir: string;
        name: string;
    } = {
        dir: null,
        name: null
    };

    private componentDestroy: Subject<boolean> = new Subject<boolean>();

    constructor(
        private gitDiffService: GitDiffService,
        private utilityService: UtilityService,
        private repositoryStatusService: RepositoryStatusService,
    ) {
    }

    ngOnInit() {
        this.observeStatusChange();
        this.observeDiff();
    }

    openDirectory() {

    }

    ngOnDestroy(): void {
        this.componentDestroy.next(true);
    }

    private observeDiff() {
        this.gitDiffService.getDiff()
        .pipe(
            takeUntil(this.componentDestroy)
        )
        .subscribe(
            diffStatus => {
                this.diffStatus = diffStatus;
                if (!!diffStatus && diffStatus.directory) {
                    const splitName = this.utilityService.extractFrontPath(diffStatus.directory);
                    this.info = {
                        name: splitName.end,
                        dir: splitName.front
                    };
                } else {
                    this.info = {
                        name: null,
                        dir: null
                    };
                }
            }
        );
    }

    private observeStatusChange() {
        this.repositoryStatusService.select().pipe(
            distinctUntilChanged()
        ).subscribe(statusSum => {
            this.statusSummary = statusSum;
        });
    }
}
