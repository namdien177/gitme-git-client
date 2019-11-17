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
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { diffChangeStatus, GitDiffService } from '../../../state/DATA/git-diff';
import { MatBottomSheet } from '@angular/material';
import { SingleComponent } from '../_dialogs/context-option/single/single.component';
import { pathNode } from '../../../types/types.electron';
import { FileSystemService } from '../../../../services/system/fileSystem.service';
import { deepEquals } from '../../../utilities/utilityHelper';

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

  repository: Repository;
  private _fileActivated: FileStatusSummaryView = null;

  constructor(
    protected utilities: UtilityService,
    private repositoriesService: RepositoriesService,
    private repositoriesQuery: RepositoriesQuery,
    private repositoryStatusService: RepositoryStatusService,
    private fileService: FileSystemService,
    private gitDiffService: GitDiffService,
    private matBottomSheet: MatBottomSheet,
  ) {
  }

  ngAfterViewInit(): void {
  }

  ngOnInit() {
    this.repositoriesService.selectActive().pipe(
      switchMap(repository => {
        this.repository = repository;
        return this.repositoryStatusService.select();
      }),
      // distinctUntilChanged()
    ).subscribe(
      summary => {
        this.statusSummary = summary;
        this.emitStatusCheckedFile(summary.files);
        if (summary.files.length > 0) {
          // auto select the first file
          this.viewDiffFile(summary.files[0], 0);
        } else {
          this.gitDiffService.reset();
        }
      }
    );
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

  trackByPath(index: number, item: FileStatusSummaryView) {
    return item.path || item.working_dir;
  }

  viewDiffFile(fileSummary: FileStatusSummaryView, index: number) {
    // if (!!this._fileActivated && fileSummary.path === this._fileActivated.path) {
    //   return;
    // }

    const path = pathNode.join(this.repository.directory, fileSummary.path);
    if (this.fileService.isFileOversize(path, 29 * 1024).code === 1) {
      return this.gitDiffService.setOversizeFile();
    }

    fromPromise(this.repositoriesService.getDiffOfFile(this.repository, fileSummary))
    .pipe(
      distinctUntilChanged(),
    )
    .subscribe((diff) => {
      let status: diffChangeStatus = 'new';
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

      this._fileActivated = fileSummary;
      this.repositoryStatusService.setActive(index);
    });
  }

  openContextDialog(file: FileStatusSummaryView) {
    const dataTransfer = {
      file,
      repository: this.repository
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
