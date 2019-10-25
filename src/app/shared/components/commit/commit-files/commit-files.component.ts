import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UtilityService } from '../../../utilities/utility.service';
import { RepositoriesQuery, RepositoriesService, Repository } from '../../../state/DATA/repositories';
import {
    createInitialState,
    FileStatusSummaryView,
    RepositoryStatusService,
    RepositoryStatusState
} from '../../../state/DATA/repository-status';
import { fromPromise } from 'rxjs/internal-compatibility';
import { switchMap, tap } from 'rxjs/operators';
import { GitDiffService } from '../../../state/DATA/git-diff';
import { MatBottomSheet } from '@angular/material';
import { SingleComponent } from '../_dialogs/context-option/single/single.component';

@Component({
    selector: 'gitme-commit-files',
    templateUrl: './commit-files.component.html',
    styleUrls: ['./commit-files.component.scss']
})
export class CommitFilesComponent implements OnInit, AfterViewInit {
    statusSummary: RepositoryStatusState = createInitialState();

    @Output()
    isAllFileChecked = new EventEmitter<boolean>();

    @Output()
    checkingChanges = new EventEmitter<FileStatusSummaryView>();

    @Output()
    checkingFiles = new EventEmitter<FileStatusSummaryView[]>();

    @Output()
    fileActivated = new EventEmitter<FileStatusSummaryView>();

    repository: Repository;
    private _fileActivated: FileStatusSummaryView = null;

    constructor(
        protected utilities: UtilityService,
        private repositoriesService: RepositoriesService,
        private repositoriesQuery: RepositoriesQuery,
        private repositoryStatusService: RepositoryStatusService,
        private gitDiffService: GitDiffService,
        private matBottomSheet: MatBottomSheet
    ) {
        this.repositoriesService.selectActive(false).pipe(
            switchMap(repository => {
                this.repository = repository;
                return this.repositoryStatusService.select();
            })
        ).subscribe(
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

    ngAfterViewInit(): void {

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

    openContextDialog(file: FileStatusSummaryView) {
        const dataTransfer = {
            file
        };
        const contextOpen = this.matBottomSheet.open(SingleComponent, {
            panelClass: ['bg-primary-black', 'p-2-option'],
            data: dataTransfer,
        });

        contextOpen.afterDismissed().subscribe(data => {
            console.log(data);
        });
    }
}
