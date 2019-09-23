import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Diff2Html } from 'diff2html';
import { GitDiffService } from '../../../../shared/states/DATA/git-diff';
import { GitDiff } from '../../../../shared/model/GitDiff';
import { HighlightResult } from 'ngx-highlightjs';
import { CodeHighlightService } from '../../../../services/features/code-highlight.service';

@Component({
    selector: 'gitme-repo-changes',
    templateUrl: './repo-changes.component.html',
    styleUrls: ['./repo-changes.component.scss']
})
export class RepoChangesComponent implements OnInit, AfterViewInit {

    outputHTML: GitDiff = null;

    constructor(
        private gitDiffService: GitDiffService,
        private codeHighlight: CodeHighlightService
    ) {
    }

    ngOnInit() {
        this.gitDiffService.getDiff().subscribe(
            diffStatus => {
                if (!!diffStatus.diff && diffStatus.diff.length > 0) {
                    const diff: GitDiff = Diff2Html.getJsonFromDiff(diffStatus.diff, {
                        inputFormat: 'diff',
                        showFiles: true,
                        matching: 'lines'
                    })[0];
                    diff.blocks[0].lines.forEach((val, index, currentArr) => {
                        currentArr[index].content = this.codeHighlight.getHighlighted(val.content);
                    });
                    this.outputHTML = diff;
                    console.log(this.outputHTML);
                    // this.codeHighlight.highlight();
                } else {
                    this.outputHTML = null;
                }
            }
        );
    }

    highlighted($event: HighlightResult) {
        console.log($event);
    }

    ngAfterViewInit(): void {
        // this.codeHighlight.highlight().then(
        //     status => {
        //         console.log(status);
        //     }
        // );
    }
}
