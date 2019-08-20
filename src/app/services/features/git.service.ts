import { Injectable } from '@angular/core';
import * as git from 'simple-git/promise';
import { UtilityService } from '../../shared/utilities/utility.service';
import { Account } from '../../shared/states/account-list';
import { RepositoryBranchesService, RepositoryBranchSummary } from '../../shared/states/repository-branches';

@Injectable()
export class GitService {

  constructor(
    private utilities: UtilityService,
    private repositoryBranchesService: RepositoryBranchesService
  ) {
  }

  git(dir?) {
    return git(dir);
  }

  cloneTo(cloneURL: string, directory: string, credentials?: Account) {
    let urlRemote = cloneURL;
    directory = directory + this.utilities.repositoryNameFromHTTPS(cloneURL);
    if (credentials) {
      urlRemote = this.utilities.addCredentialsToRemote(cloneURL, credentials);
    }
    return git().clone(urlRemote, directory);
  }

  async allBranches(directory: string, credentials?: { username: string, password: string }) {
    directory = this.utilities.directorySafePath(directory);
    const branchAll = await this.git(directory).branch(['-a']);
    const branchRemote = await this.git(directory).branch(['-r']);
    const branchMerged: RepositoryBranchSummary[] = [];

    Object.keys(branchRemote.branches).forEach(branchName => {
      const viewBranch: RepositoryBranchSummary = branchRemote.branches[branchName];
      const arrSplitName = viewBranch.name.split('origin/');
      if (arrSplitName.length > 1 && arrSplitName[1] === branchAll.current) {
        Object.assign(viewBranch, { ...viewBranch }, { current: true });
      }
      branchMerged.push(viewBranch);
    });
    this.repositoryBranchesService.refreshList(branchMerged);
  }

  isGitProject(directory: string) {
    directory = this.utilities.directorySafePath(directory);
    // directory = 'D:\\Projects\\Acomici\\acomici.com';
    return git(directory).checkIsRepo();
    // .then(value => {
    //   if (value) {
    //     git(directory).updateServerInfo().then(
    //       val => console.log(val)
    //     );
    //     git(directory).status().then(
    //       val => console.log(val)
    //     );
    //     // git(directory).show().then(
    //     //   val => console.log(val)
    //     // );
    //     git(directory).branchLocal().then(
    //       val => console.log(val)
    //     );
    //     git(directory).getRemotes(true).then(
    //       val => console.log(val)
    //     );
    //     git(directory).branch(['-r']).then(
    //       val => console.log(val)
    //     );
    //   }
    //
    //   return value;
    // });
  }
}
