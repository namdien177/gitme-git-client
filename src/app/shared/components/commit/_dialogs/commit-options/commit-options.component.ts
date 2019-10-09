import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
    selector: 'gitme-commit-options',
    templateUrl: './commit-options.component.html',
    styleUrls: ['./commit-options.component.scss']
})
export class CommitOptionsComponent implements OnInit {

    private readonly initialData;

    constructor(
        public dialogRef: MatDialogRef<CommitOptionsComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.initialData = data;
    }

    ngOnInit() {
    }

    chooseNo() {
        this.dialogRef.close(this.initialData);
    }
}
