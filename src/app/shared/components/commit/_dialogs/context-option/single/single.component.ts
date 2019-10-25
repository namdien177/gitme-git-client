import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material';
import { FileStatusSummaryView } from '../../../../../state/DATA/repository-status';

@Component({
    selector: 'gitme-single',
    templateUrl: './single.component.html',
    styleUrls: ['./single.component.scss']
})
export class SingleComponent implements OnInit {

    extension = '';

    constructor(
        private _bottomSheetRef: MatBottomSheetRef<SingleComponent>,
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: {
            file: FileStatusSummaryView
        }
    ) {
    }

    ngOnInit() {
        const splitPath = this.data.file.path.split('.');
        this.extension = splitPath[splitPath.length - 1];
    }

    dismissed() {
        this._bottomSheetRef.dismiss();
    }
}
