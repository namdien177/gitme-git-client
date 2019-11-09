import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { YesNoDialogModel } from '../../../../model/yesNoDialog.model';

@Component({
  selector: 'gitme-yes-no-decision',
  templateUrl: './yes-no-decision.component.html',
  styleUrls: ['./yes-no-decision.component.scss']
})
export class YesNoDecisionComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public emittedDataFromView: YesNoDialogModel,
    public dialogRef: MatDialogRef<YesNoDecisionComponent>,
  ) {
  }

  ngOnInit() {
  }

  closeDialog(val: boolean) {
    this.dialogRef.close(val);
  }
}
