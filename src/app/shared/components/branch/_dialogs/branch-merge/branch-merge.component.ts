import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { YesNoDialogModel } from '../../../../model/yesNoDialog.model';
import { FormBuilder } from '@angular/forms';
import { RepositoriesService, Repository } from '../../../../state/DATA/repositories';
import { RepositoryBranchesService, RepositoryBranchSummary } from '../../../../state/DATA/repository-branches';
import { RepositoryStatusService } from '../../../../state/DATA/repository-status';

@Component({
  selector: 'gitme-branch-merge',
  templateUrl: './branch-merge.component.html',
  styleUrls: ['./branch-merge.component.scss']
})
export class BranchMergeComponent implements OnInit {

  allBranches: RepositoryBranchSummary[] = [];
  displayBranches: RepositoryBranchSummary[] = [];
  selectedBranch: RepositoryBranchSummary = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: YesNoDialogModel<{
      repository: Repository,
      branch: RepositoryBranchSummary
    }>,
    public dialogRef: MatDialogRef<BranchMergeComponent>,
    private fb: FormBuilder,
    private repositoryService: RepositoriesService,
    private branchService: RepositoryBranchesService,
    private statusService: RepositoryStatusService
  ) {
    this.allBranches = this.branchService.get()
    .filter(br => br.id !== data.data.branch.id);
    this.displayBranches = [...this.allBranches];
  }

  ngOnInit() {
  }

  trackBranchID(index: number, item: RepositoryBranchSummary) {
    return item.id;
  }

  checkMerge(branch: RepositoryBranchSummary) {
    this.selectedBranch = branch;
  }
}
