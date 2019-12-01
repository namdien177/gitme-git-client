import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material';
import { YesNoDialogModel } from '../../../../model/yesNoDialog.model';
import { GitLogsService } from '../../../../state/DATA/logs';
import { RepositoriesService } from '../../../../state/DATA/repositories';

@Component({
  selector: 'gitme-revert-options',
  templateUrl: './revert-options.component.html',
  styleUrls: ['./revert-options.component.scss']
})
export class RevertOptionsComponent implements OnInit {

  hash: string;
  index: number;
  isLocal: boolean;

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<RevertOptionsComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: YesNoDialogModel,
    private logsService: GitLogsService,
    private repositoriesService: RepositoriesService
  ) {
    this.hash = data.data['hash'];
    this.index = data.data['index'];
    this.isLocal = data.data['isLocal'];
  }

  ngOnInit() {
  }

  revertCommit() {
    const currentRepo = this.repositoriesService.getActive();
    this.logsService.revertCommitRemote(currentRepo, this.hash).subscribe(() => {
      this._bottomSheetRef.dismiss('REVERT');
    });
  }

  undoCommit() {
    const currentRepo = this.repositoriesService.getActive();
    this.logsService.revertCommitLocal(currentRepo, this.hash).subscribe(() => {
      this._bottomSheetRef.dismiss('UNDO');
    });
  }

}
