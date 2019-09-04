import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { UtilityService } from '../../utilities/utility.service';
import { StatusSummary } from '../../model/StatusSummary';
import { RepositoriesQuery, RepositoriesService, Repository } from '../../states/DATA/repositories';
import { switchMap } from 'rxjs/operators';
import { FileStatusSummary } from '../../model/FileStatusSummary';

@Component({
    selector: 'gitme-commit-files',
    templateUrl: './commit-files.component.html',
    styleUrls: ['./commit-files.component.scss']
})
export class CommitFilesComponent implements OnInit {

    statusSummary: StatusSummary;
    @Output()
    commitFiles = new EventEmitter<FileStatusSummary>();

    private repository: Repository = null;

    constructor(
        protected utilities: UtilityService,
        private repositoriesService: RepositoriesService,
        private repositoriesQuery: RepositoriesQuery,
        private fb: FormBuilder
    ) {
        this.repositoriesService.getActive()
        .pipe(switchMap(repo => {
            this.repository = repo;
            return this.repositoriesService.getBranchStatus(
                this.repository
            );
        })).subscribe(
            summary => {
                this.statusSummary = summary;
            }
        );
    }

    ngOnInit() {

    }


    emitFilesChoice() {

    }
}
