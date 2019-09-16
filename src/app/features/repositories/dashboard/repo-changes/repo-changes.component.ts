import { Component, OnInit } from '@angular/core';
import { Diff2Html } from 'diff2html';
import { GitDiffService } from '../../../../shared/states/DATA/git-diff';
import { GitDiff } from '../../../../shared/model/GitDiff';

@Component({
    selector: 'gitme-repo-changes',
    templateUrl: './repo-changes.component.html',
    styleUrls: ['./repo-changes.component.scss']
})
export class RepoChangesComponent implements OnInit {

    outputHTML: GitDiff = null;

    constructor(
        private gitDiffService: GitDiffService
    ) {
    }

    ngOnInit() {
        this.gitDiffService.getDiff().subscribe(
            diffStatus => {
                if (!!diffStatus.diff && diffStatus.diff.length > 0) {
                    this.outputHTML = Diff2Html.getJsonFromDiff(diffStatus.diff, {
                        inputFormat: 'diff',
                        showFiles: true,
                        matching: 'lines'
                    })[0];
                    console.log(this.outputHTML);
                } else {
                    this.outputHTML = null;
                }
            }
        );
    }

}
