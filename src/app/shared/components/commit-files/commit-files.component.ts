import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilityService } from '../../utilities/utility.service';
import { StatusSummary } from '../../model/StatusSummary';

@Component({
    selector: 'gitme-commit-files',
    templateUrl: './commit-files.component.html',
    styleUrls: ['./commit-files.component.scss']
})
export class CommitFilesComponent implements OnInit {

    listFile: FormGroup;
    statusSummary: StatusSummary;

    constructor(
        protected utilities: UtilityService,
        private fb: FormBuilder
    ) {
    }

    ngOnInit() {
        this.listFile = this.fb.group({
            files: [[], [Validators.required]],
            title: ['', [Validators.required]]
        });
    }

}
