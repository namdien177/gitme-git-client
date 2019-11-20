import { Component, OnInit } from '@angular/core';
import { RepositoriesService, Repository } from '../../../shared/state/DATA/repositories';
import { GitLogsService, ListLogLine } from '../../../shared/state/DATA/logs';
import { RepositoryStatusService } from '../../../shared/state/DATA/repository-status';
import { catchError, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';
import { FileChangeStatus, LogFile } from '../../../shared/state/DATA/logs-files';
import { UtilityService } from '../../../shared/utilities/utility.service';
import { diffChangeStatus } from '../../../shared/state/DATA/git-diff';

@Component({
  selector: 'gitme-repo-history',
  templateUrl: './repo-history.component.html',
  styleUrls: ['./repo-history.component.scss']
})
export class RepoHistoryComponent implements OnInit {

  repository: Repository = null;
  viewLogs: ListLogLine = null;
  commitmentFiles: { file: LogFile, active: boolean }[] = [];
  activeFile: LogFile = null;

  constructor(
    private repositoryService: RepositoriesService,
    private statusService: RepositoryStatusService,
    private logsService: GitLogsService,
    public utilities: UtilityService
  ) {
    this.repository = this.repositoryService.getActive();
    this.logsService.initialLogs(this.repository).subscribe(prepareComplete => {
      this.activeViewTracking();
    });
  }

  ngOnInit() {
  }

  activeViewTracking() {
    this.logsService.observeActive()
    .pipe(
      // filter((commit) => !!commit),
      // skipWhile(log => deepEquals(log, this.viewLogs)),
      distinctUntilChanged(),
      catchError(err => {
        console.log(err);
        return null;
      }),
      switchMap((log: ListLogLine) => {
        console.log(log);
        this.viewLogs = log;
        this.activeFile = null;
        return fromPromise(this.statusService.filesFromCommit(this.repository, log.hash));
      }),
    )
    .subscribe(res => {
      this.commitmentFiles = res.map((file, index) => {
        return { file: file, active: index === 0 };
      });
      this.viewDiffFile(this.commitmentFiles[0].file);
    });
  }

  openDirectory() {

  }

  viewDiffFile(file: LogFile) {
    fromPromise(this.statusService.diffOfFileFromCommit(
      this.repository, file.path, this.getFileStatus(file.status), this.viewLogs.hash
    )).subscribe(gitDiff => {
      console.log(gitDiff);
      this.activeFile = file;
      this.changeActive(file.path);
    });
  }

  private changeActive(activeFilePath: string) {
    this.commitmentFiles = this.commitmentFiles.map(sel => {
      return { file: sel.file, active: sel.file.path === activeFilePath };
    });
  }

  private getFileStatus(status: FileChangeStatus): diffChangeStatus {
    switch (status) {
      case FileChangeStatus.added:
        return 'new';
      case FileChangeStatus.deleted:
        return 'delete';
      case FileChangeStatus.modified:
        return 'change';
      default:
        return 'change';
    }
  }
}
