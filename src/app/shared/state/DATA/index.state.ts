import { Injectable } from '@angular/core';
import { AccountListService } from './accounts';
import { RepositoryBranchesService } from './branches';
import { GitDiffService } from './git-diff';
import { GitLogsService } from './logs';
import { RepositoriesService } from './repositories';
import { RepositoryStatusService } from './repository-status';

@Injectable()
export class StateManage {

  constructor(
    private account: AccountListService,
    private repository: RepositoriesService,
    private branch: RepositoryBranchesService,
    private diff: GitDiffService,
    private logs: GitLogsService,
    private status: RepositoryStatusService
  ) {
  }

  resetRepositoryInformation() {
    this.branch.reset();
    this.diff.reset();
    this.logs.reset();
    this.status.reset();
  }
}
