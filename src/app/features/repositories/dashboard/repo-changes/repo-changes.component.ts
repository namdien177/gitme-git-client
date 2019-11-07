import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { GitDiffService } from '../../../../shared/state/DATA/git-diff';
import { GitDiffResult } from '../../../../shared/model/gitDiff.model';

@Component({
  selector: 'gitme-repo-changes',
  templateUrl: './repo-changes.component.html',
  styleUrls: ['./repo-changes.component.scss']
})
export class RepoChangesComponent implements OnInit, AfterViewInit {

  outputHTML: GitDiffResult = null;

  constructor(
    private gitDiffService: GitDiffService,
    private cd: ChangeDetectorRef
  ) {
  }

  ngOnInit() {
    this.gitDiffService.getDiff().subscribe(
      diffStatus => {
        if (!!diffStatus && !!diffStatus.diff) {
          console.log(diffStatus);
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
