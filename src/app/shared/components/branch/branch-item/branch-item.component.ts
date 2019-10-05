import { Component, Input, OnInit } from '@angular/core';
import { RepositoryBranchSummary } from '../../../state/DATA/repository-branches';

@Component({
    selector: 'gitme-branch-item',
    templateUrl: './branch-item.component.html',
    styleUrls: ['./branch-item.component.scss']
})
export class BranchItemComponent implements OnInit {

    @Input() branchSummary: RepositoryBranchSummary;

    constructor() {
    }

    ngOnInit() {
    }

}
