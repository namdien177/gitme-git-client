import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material';
import { RepositoryBranchSummary } from '../../../../state/DATA/repository-branches';
import { StatusSummary } from '../../../../model/statusSummary.model';

@Component({
    selector: 'gitme-branch-options',
    templateUrl: './branch-options.component.html',
    styleUrls: ['./branch-options.component.scss']
})
export class BranchOptionsComponent implements OnInit {

    constructor(
        private _bottomSheetRef: MatBottomSheetRef<BranchOptionsComponent>,
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: {
            branch: RepositoryBranchSummary
            status: StatusSummary
        }
    ) {
        console.log(data);
    }

    ngOnInit() {
    }

}
