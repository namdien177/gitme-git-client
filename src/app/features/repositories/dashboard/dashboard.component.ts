import { Component, OnInit } from '@angular/core';
import { GitDiffService, GitDiffState } from '../../../shared/states/DATA/git-diff';

@Component({
    selector: 'gitme-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

    diffStatus: GitDiffState = null;

    constructor(
        private gitDiffService: GitDiffService
    ) {
    }

    ngOnInit() {
        this.gitDiffService.getDiff().subscribe(
            diffStatus => {
                this.diffStatus = diffStatus;
            }
        );
    }

}
