import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UtilityService } from '../../../utilities/utility.service';
import { RepositoriesQuery, RepositoriesService, Repository } from '../../../states/DATA/repositories';
import {
    createInitialState,
    FileStatusSummaryView,
    RepositoryStatusService,
    RepositoryStatusState
} from '../../../states/DATA/repository-status';
import { fromPromise } from 'rxjs/internal-compatibility';
import { tap } from 'rxjs/operators';
import { GitDiffService } from '../../../states/DATA/git-diff';

@Component({
    selector: 'gitme-commit-files',
    templateUrl: './commit-files.component.html',
    styleUrls: ['./commit-files.component.scss']
})
export class CommitFilesComponent implements OnInit {

    statusSummary: RepositoryStatusState = createInitialState();

    @Input() repository: Repository;

    @Output()
    isAllFileChecked = new EventEmitter<boolean>();

    @Output()
    checkingChanges = new EventEmitter<FileStatusSummaryView>();

    @Output()
    checkingFiles = new EventEmitter<FileStatusSummaryView[]>();

    constructor(
        protected utilities: UtilityService,
        private repositoriesService: RepositoriesService,
        private repositoriesQuery: RepositoriesQuery,
        private repositoryStatusService: RepositoryStatusService,
        private gitDiffService: GitDiffService
    ) {
        this.repositoryStatusService.select()
        .subscribe(
            summary => {
                this.statusSummary = summary;
                this.emitStatusCheckedFile(summary.files);
            }
        );
    }

    ngOnInit() {

    }


    toggleCheckFile(index: number) {
        const newState = this.repositoryStatusService.toggleCheckbox(index);
        this.checkingChanges.emit(newState.newItemState);
    }

    emitStatusCheckedFile(summary: FileStatusSummaryView[]) {
        const checkStatus = this.emitCheckedFiles(summary);
        this.isAllFileChecked.emit(checkStatus.is_all);
        this.checkingFiles.emit(checkStatus.checkedList);
    }

    emitCheckedFiles(summaryFiles: FileStatusSummaryView[]) {
        const checkedFiles: FileStatusSummaryView[] = [];
        let isAllChecked = true;
        summaryFiles.forEach(file => {
            if (file.checked === false) {
                isAllChecked = false;
            } else {
                checkedFiles.push(file);
            }
        });
        return {
            checkedList: checkedFiles,
            is_all: isAllChecked
        };
    }

    getAllChecked() {

    }

    trackByPath(item: FileStatusSummaryView) {
        return item.path;
    }

    viewDiffFile(fileSummary: FileStatusSummaryView, index: number) {
        fromPromise(this.repositoriesService.getDiffOfFile(this.repository, fileSummary))
        .pipe(
            tap(diff => {
                this.gitDiffService.setDiff(
                    diff,
                    fileSummary.path
                );
            })
        )
        .subscribe(() => {
            this.repositoryStatusService.toggleActive(index);
        });
    }
}
