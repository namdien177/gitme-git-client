import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { CommitOptionsDialogs } from '../../../../model/yesNoDialog.model';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { CommitOptions } from '../../../../state/DATA/repository-branches';

@Component({
    selector: 'gitme-commit-options',
    templateUrl: './commit-options.component.html',
    styleUrls: ['./commit-options.component.scss']
})
export class CommitOptionsComponent implements OnInit {

    // @debug
    debuging = {
        value: '"do hoang nam <do.hoangnam9x@gmail.com>"',
        argument: '--author'
    };

    errorMessage = null;

    formOptions: FormGroup;
    private readonly initialData;

    constructor(
        public dialogRef: MatDialogRef<CommitOptionsComponent>,
        private fb: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public emittedDataFromView: CommitOptionsDialogs
    ) {
        this.initialData = emittedDataFromView;
    }

    get commitOption() {
        return this.formOptions.get('options') as FormArray;
    }

    ngOnInit() {
        this.formOptions = this.fb.group({
            options: this.fb.array([this.createItem()])
        });
        this.initializeData();
    }

    initializeData() {
        if (!!this.emittedDataFromView && !!this.emittedDataFromView.data) {
            this.emittedDataFromView.data.forEach(command => {
                this.addNewOption(command);
            });
        }
    }

    typingCommand() {
        const numberArgCurrent = this.commitOption.length;
        if (numberArgCurrent > 1) {
            // from 3 above
            // check if the last input row was empty
            const lastRow = (<FormGroup>this.commitOption.controls[numberArgCurrent - 1]).controls;
            const behindOne = (<FormGroup>this.commitOption.controls[numberArgCurrent - 2]).controls;
            if (lastRow['argument'].value.length > 0 || lastRow['value'].value.length > 0) {
                // add new row below
                this.addNewOption();
            } else if (behindOne['argument'].value.length === 0 && behindOne['value'].value.length === 0) {
                // remove because previous box was empty
                this.removeNewOption();
            }
        } else {
            const firsRow = (<FormGroup>this.commitOption.controls[numberArgCurrent - 1]).controls;
            if (firsRow['argument'].value.length > 0 || firsRow['value'].value.length > 0) {
                // add new row below
                this.addNewOption();
            }
        }

        const notContainDuplicated = this.checkDuplicatedArgument();
        if (notContainDuplicated) {
            this.errorMessage = null;
        } else {
            this.errorMessage = 'Some arguments are duplicated!';
        }
    }

    removeEmptyCommand() {
        const numberArgCurrent = this.commitOption.length;
        if (numberArgCurrent > 1) {
            this.commitOption.controls.every((form: FormGroup, index) => {
                if (index !== numberArgCurrent - 1) {
                    if (form.controls['argument'].value.length === 0 && form.controls['value'].value.length === 0) {
                        this.commitOption.removeAt(index);
                        return false;
                    }
                }
                return true;
            });

            if (numberArgCurrent !== this.commitOption.length) {
                this.typingCommand();
            }
        }
    }

    prepareData() {
        return (<CommitOptions[]>this.commitOption.value)
        .filter(option => !(option.argument.length === 0 && option.value.length === 0));
    }

    submitNewOptions() {
        const getFinalData = this.prepareData();
        this.dialogRef.close(getFinalData);
    }

    private checkDuplicatedArgument() {
        const numberArgCurrent = this.commitOption.length;
        let statusValid = true;
        const storingArgument = [];
        if (numberArgCurrent > 1) {
            this.commitOption.controls.every((form: FormGroup, index) => {
                if (!!form.value) {
                    const strCompare = (<string>form.value['argument']).toLowerCase();
                    if (strCompare.length > 0) {
                        if (storingArgument.indexOf(strCompare) > -1) {
                            statusValid = false;
                            return false;
                        }
                        storingArgument.push(strCompare);
                    }
                }
                return true;
            });
        }
        return statusValid;
    }

    private addNewOption(data: CommitOptions = null) {
        this.commitOption.push(this.createItem(data));
    }

    private removeNewOption() {
        const numberArgCurrent = this.commitOption.length;
        this.commitOption.removeAt(numberArgCurrent - 1);
    }

    private createItem(data: CommitOptions = null): FormGroup {
        return this.fb.group({
            argument: [!!data ? data.argument : ''],
            value: [!!data ? data.value : ''],
        });
    }
}
