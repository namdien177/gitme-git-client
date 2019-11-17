import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { YesNoDialogModel } from '../../../../model/yesNoDialog.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RepositoryBranchesService, RepositoryBranchSummary } from '../../../../state/DATA/branches';
import { shouldNotExistInArray } from '../../../../validate/customFormValidate';
import { distinctUntilChanged } from 'rxjs/operators';
import { isValidNameGitBranch } from '../../../../utilities/utilityHelper';

@Component({
  selector: 'gitme-branch-rename',
  templateUrl: './branch-rename.component.html',
  styleUrls: ['./branch-rename.component.scss']
})
export class BranchRenameComponent implements OnInit {

  formNewName: FormGroup;

  currentData: RepositoryBranchSummary;
  branches: string[] = [];
  parseNameBranch: string = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public emittedDataFromView: YesNoDialogModel<RepositoryBranchSummary>,
    public dialogRef: MatDialogRef<BranchRenameComponent>,
    public fb: FormBuilder,
    private repositoryBranchService: RepositoryBranchesService,
  ) {
    this.currentData = this.emittedDataFromView.data;
    this.branches = this.repositoryBranchService.get().map(each => {
      const value = each.name;
      if (value.indexOf('origin/') === 0) {
        const indexFirstSlash = value.indexOf('/');
        return value.slice(indexFirstSlash + 1);
      }
      return value;
    });
  }

  get name() {
    return this.formNewName.get('name');
  }

  get removeOnRemote() {
    return this.formNewName.get('removeOnRemote');
  }

  get pushToRemote() {
    return this.formNewName.get('pushToRemote');
  }

  ngOnInit() {
    this.formNewName = this.fb.group({
      name: [this.currentData.name, [
        Validators.required,
        Validators.minLength(1),
        shouldNotExistInArray(this.branches, 'existing branches')
      ]],
      removeOnRemote: new FormControl(
        { value: false, disabled: !this.currentData.has_remote },
        []
      ),
      pushToRemote: [false, []],
    });

    // Listen to input branch to parse to safe name
    this.name.valueChanges.pipe(
      // debounceTime(100),
      distinctUntilChanged()
    ).subscribe(value => {
      const safeValue = isValidNameGitBranch(value);
      if (safeValue.status) {
        this.name.setValue(value);
        this.parseNameBranch = null;
      } else {
        this.name.setValue(value);
        this.parseNameBranch = safeValue.msg;
      }
    });
  }

  confirmAction() {
    const emitData = {
      name: this.name.value,
      remove: this.removeOnRemote.value,
      push: this.pushToRemote.value,
    };
    this.dialogRef.close(emitData);
  }

}
