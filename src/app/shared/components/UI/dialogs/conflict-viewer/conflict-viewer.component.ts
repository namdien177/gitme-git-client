import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { YesNoDialogModel } from '../../../../model/yesNoDialog.model';
import { Repository } from '../../../../state/DATA/repositories';
import { RepositoryBranchSummary } from '../../../../state/DATA/branches';
import { StatusSummary } from '../../../../model/statusSummary.model';
import { RepositoryStatusService } from '../../../../state/DATA/repository-status';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { GitService } from '../../../../../services/features/core/git.service';
import { fromPromise } from 'rxjs/internal-compatibility';

@Component({
  selector: 'gitme-conflict-viewer',
  templateUrl: './conflict-viewer.component.html',
  styleUrls: ['./conflict-viewer.component.scss']
})
export class ConflictViewerComponent implements OnInit {

  statusSummary: StatusSummary;
  listConflicted: {
    path: string,
    status: boolean
  }[] = [];

  resolvedConflict = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: YesNoDialogModel<{
      repository: Repository,
      branch: RepositoryBranchSummary
    }>,
    public dialogRef: MatDialogRef<ConflictViewerComponent>,
    private repositoryStatusService: RepositoryStatusService,
    // debug
    private git: GitService
  ) {
    // ensure to resolve the conflict before continue
    dialogRef.disableClose = true;
    this.repositoryStatusService.select().pipe(
      distinctUntilChanged(),
      switchMap(status => {
        this.statusSummary = status;
        return fromPromise(this.git.checkConflict(this.repository));
      })
    ).subscribe(fileStatus => {
      this.resolvedConflict = fileStatus.length === 0;
      this.buildListConflict(this.statusSummary.conflicted, fileStatus);
    });
  }

  get repository() {
    return this.data.data.repository;
  }

  get branch() {
    return this.data.data.branch;
  }

  ngOnInit() {
  }

  /**
   * Abort = false
   * Continue = true
   * @param decision
   */
  decision(decision: boolean) {
    this.dialogRef.close(decision);
  }

  buildListConflict(summaryConflicted: string[], fileChecked: string[]) {
    console.log(summaryConflicted);
    this.listConflicted = summaryConflicted.map(path => {
      if (Array.isArray(path)) {
        path = path.join('');
      } else if (typeof path === 'object') {
        path = Object.keys(path).map(key => path[key]).join('');
      }
      return {
        path: path,
        status: !(fileChecked.indexOf(path) > -1)
      };
    });
  }

  trackByPath(index: number, item: { path: string, status: boolean }) {
    return item.path || item.status;
  }
}
