import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material';
import { FileStatusSummaryView } from '../../../../../state/DATA/repository-status';
import { RepositoryBranchesService } from '../../../../../state/DATA/repository-branches';
import { Repository } from '../../../../../state/DATA/repositories';

@Component({
    selector: 'gitme-single',
    templateUrl: './single.component.html',
    styleUrls: ['./single.component.scss']
})
export class SingleComponent implements OnInit {

    extension = '';
    private readonly file;
    private readonly repository;

    constructor(
        private _bottomSheetRef: MatBottomSheetRef<SingleComponent>,
        private branchServices: RepositoryBranchesService,
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: {
            file: FileStatusSummaryView,
            repository: Repository
        },
    ) {
        this.file = data.file;
        this.repository = data.repository;
        if (!this.file || !this.repository) {
            this.dismissed();
        }
    }

    ngOnInit() {
        const splitPath = this.data.file.path.split('.');
        this.extension = splitPath[splitPath.length - 1];
    }

    dismissed() {
        this._bottomSheetRef.dismiss();
    }

    revertChanges() {

    }
}
