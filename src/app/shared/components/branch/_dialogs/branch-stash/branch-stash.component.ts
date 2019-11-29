import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { YesNoDialogModel } from '../../../../model/yesNoDialog.model';

@Component({
  selector: 'gitme-branch-stash',
  templateUrl: './branch-stash.component.html',
  styleUrls: ['./branch-stash.component.scss']
})
export class BranchStashComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<BranchStashComponent>,
    @Inject(MAT_DIALOG_DATA) public data: YesNoDialogModel,
  ) {
  }

  ngOnInit() {
  }

  abortCheckout() {
    this.dialogRef.close();
  }
}
