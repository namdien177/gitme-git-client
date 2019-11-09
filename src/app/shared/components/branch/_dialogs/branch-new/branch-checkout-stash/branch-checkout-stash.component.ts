import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { YesNoDialogModel } from '../../../../../model/yesNoDialog.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'gitme-branch-checkout-stash',
  templateUrl: './branch-checkout-stash.component.html',
  styleUrls: ['./branch-checkout-stash.component.scss']
})
export class BranchCheckoutStashComponent implements OnInit {

  choices: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public emittedDataFromView: YesNoDialogModel,
    public dialogRef: MatDialogRef<BranchCheckoutStashComponent>,
    private fb: FormBuilder,
  ) {
  }

  get stash() {
    return this.choices.get('stash');
  }

  ngOnInit() {
    this.choices = this.fb.group({
      stash: [0, [Validators.required]]
    });
  }

  /**
   * 0 = cancel
   * 1 = from master
   * 2 = from current
   * @param confirmStash
   */
  confirm(confirmStash: 0 | 1 | 2 = 0) {
    this.dialogRef.close(confirmStash);
  }
}
