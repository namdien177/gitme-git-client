import { AfterViewInit, Component, OnInit } from '@angular/core';
import { GitDiffService } from '../../../../shared/states/DATA/git-diff';
import { GitDiff } from '../../../../shared/model/GitDiff';

@Component({
    selector: 'gitme-repo-changes',
    templateUrl: './repo-changes.component.html',
    styleUrls: ['./repo-changes.component.scss']
})
export class RepoChangesComponent implements OnInit, AfterViewInit {

    outputHTML: GitDiff = null;

    constructor(
        private gitDiffService: GitDiffService,
    ) {
    }

    ngOnInit() {
        this.gitDiffService.getDiff().subscribe(
            diffStatus => {
                if (!!diffStatus && !!diffStatus.diff) {
                    this.outputHTML = diffStatus.diff;
                } else {
                    this.outputHTML = null;
                }
            }
        );
    }

    ngAfterViewInit(): void {

    }
}
