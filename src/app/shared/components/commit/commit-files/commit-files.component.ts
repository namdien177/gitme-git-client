import { AfterViewInit, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UtilityService } from '../../../utilities/utility.service';
import { RepositoriesService, Repository } from '../../../state/DATA/repositories';
import {
  createInitialState,
  FileStatusSummaryView,
  RepositoryStatusService,
  RepositoryStatusState,
} from '../../../state/DATA/repository-status';
import { fromPromise } from 'rxjs/internal-compatibility';
import { distinctUntilChanged, skipWhile } from 'rxjs/operators';
import { diffChangeStatus, GitDiffService } from '../../../state/DATA/git-diff';
import { MatBottomSheet } from '@angular/material';
import { SingleComponent } from '../_dialogs/context-option/single/single.component';
import { pathNode } from '../../../types/types.electron';
import { FileSystemService } from '../../../../services/system/fileSystem.service';
import { deepEquals } from '../../../utilities/utilityHelper';
import { RepositoriesMenuService } from '../../../state/UI/repositories-menu';

@Component({
  selector: 'gitme-commit-files',
  templateUrl: './commit-files.component.html',
  styleUrls: ['./commit-files.component.scss'],
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
    public utilities: UtilityService,
    private menuState: RepositoriesMenuService,
    private repositoriesService: RepositoriesService,
    private repositoryStatusService: RepositoryStatusService,
    private fileService: FileSystemService,
    private gitDiffService: GitDiffService,
    private matBottomSheet: MatBottomSheet,
  ) {
  }

  ngAfterViewInit(): void {
  }

  ngOnInit() {
    return this.repositoryStatusService.select().pipe(
      distinctUntilChanged(),
      skipWhile(sum => deepEquals(sum.files, this.statusSummary.files)),
    ).subscribe(
      summary => {
        this.repository = this.repositoriesService.getActive();
        this.emitStatusCheckedFile(summary.files);
        if (summary.files.length > 0 && !deepEquals(summary.files, this.statusSummary.files) && !this._fileActivated  && this.menuState.get().commit_view === 'changes') {
          this.viewDiffFile(summary.files[0], 0);
        } else if (summary.files.length === 0 && this.menuState.get().commit_view === 'changes') {
          this.gitDiffService.reset();
          this._fileActivated = null;
        }
        this.statusSummary = summary;
      },
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
    let isAllChecked = true;
    const checkedFiles: FileStatusSummaryView[] = summaryFiles.map(file => {
      if (file.checked === false) {
        isAllChecked = false;
      }
      return file;
    });
    return {
      checkedList: checkedFiles,
      is_all: isAllChecked,
    };
  }

  trackByPath(index: number, item: FileStatusSummaryView) {
    return item.path || item.working_dir || item.active;
  }

  viewDiffFile(fileSummary: FileStatusSummaryView, index: number) {
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
        if (
          this.utilities.isStringExistIn(fileSummary.path, this.statusSummary.created) ||
          this.utilities.isStringExistIn(fileSummary.path, this.statusSummary.not_added)
        ) {
          status = 'new';
        } else if (this.utilities.isStringExistIn(fileSummary.path, this.statusSummary.deleted)) {
          status = 'delete';
        } else if (this.utilities.isStringExistIn(fileSummary.path, this.statusSummary.conflicted)) {
          status = 'conflicted';
        } else {
          status = 'change';
        }

        this.gitDiffService.setDiff(
          diff,
          fileSummary.path,
          status,
        );

        this._fileActivated = fileSummary;
        this.repositoryStatusService.setActive(index);
      });
  }

  openContextDialog(file: FileStatusSummaryView) {
    const dataTransfer = {
      file: [file],
      repository: this.repository,
      mode: 'single',
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
