import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { GitDiffService } from '../../../state/DATA/git-diff';
import { GitDiffResult } from '../../../model/gitDiff.model';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'gitme-repo-changes',
  templateUrl: './repo-changes.component.html',
  styleUrls: ['./repo-changes.component.scss']
})
export class RepoChangesComponent implements OnInit, AfterViewInit {

  outputHTML: GitDiffResult = null;

  constructor(
    private gitDiffService: GitDiffService,
  ) {
  }

  ngOnInit() {
    this.gitDiffService.getDiff()
    .pipe(
      distinctUntilChanged()
    )
    .subscribe(
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
