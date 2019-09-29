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
import { distinctUntilChanged, tap } from 'rxjs/operators';
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

    @Output()
    fileActivated = new EventEmitter<FileStatusSummaryView>();
    private _fileActivated: FileStatusSummaryView = null;

    constructor(
        protected utilities: UtilityService,
        private repositoriesService: RepositoriesService,
        private repositoriesQuery: RepositoriesQuery,
        private repositoryStatusService: RepositoryStatusService,
        private gitDiffService: GitDiffService
    ) {
        this.repositoryStatusService.select()
        .pipe(
            distinctUntilChanged()
        )
        .subscribe(
            summary => {
                this.statusSummary = summary;
                this.emitStatusCheckedFile(summary.files);
                if (summary.files.length > 0 && !summary.files[0].active && !this._fileActivated) {
                    // auto select the first file
                    this.viewDiffFile(summary.files[0], 0);
                }
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

    trackByPath(item: FileStatusSummaryView) {
        return item.path;
    }

    viewDiffFile(fileSummary: FileStatusSummaryView, index: number) {
        if (!!this._fileActivated && fileSummary.path === this._fileActivated.path) {
            return;
        }
        fromPromise(this.repositoriesService.getDiffOfFile(this.repository, fileSummary))
        .pipe(
            tap(diff => {
                let status: 'change' | 'new' | 'delete' = 'new';
                if (this.utilities.isStringExistIn(fileSummary.path, this.statusSummary.created)) {
                    status = 'new';
                } else if (this.utilities.isStringExistIn(fileSummary.path, this.statusSummary.deleted)) {
                    status = 'delete';
                } else {
                    status = 'change';
                }
                this.gitDiffService.setDiff(
                    diff,
                    fileSummary.path,
                    status
                );
            })
        )
        .subscribe(() => {
            this.fileActivated.emit(fileSummary);
            this._fileActivated = fileSummary;
            this.repositoryStatusService.setActive(index);
        });
    }
}
