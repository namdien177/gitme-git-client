import { Injectable } from '@angular/core';
import * as git from 'simple-git/promise';
import { UtilityService } from '../../shared/utilities/utility.service';
import { Account } from '../../shared/states/account-list';
import { RepositoryBranchSummary } from '../../shared/states/repository-branches';
import { Repository } from '../../shared/states/repositories';

@Injectable()
export class GitService {

  constructor(
    private utilities: UtilityService,
  ) {
  }

  git(dir?) {
    return git(dir);
  }

  async cloneTo(cloneURL: string, directory: string, credentials?: Account) {
    let urlRemote = cloneURL;
    directory = directory + this.utilities.repositoryNameFromHTTPS(cloneURL);
    if (credentials) {
      urlRemote = this.utilities.addCredentialsToRemote(cloneURL, credentials);
    }
    return git().clone(urlRemote, directory);
  }

  async allBranches(directory: string, credentials?: Account) {
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
    return branchMerged;
  }

  async fetchInfo(repository: Repository, credentials?: Account, customRemote: string = null) {
    // retrieve the directory for git to execute
    const directory = this.utilities.directorySafePath(repository.directory);

    // checking remotes
    let urlRemotes: string = null;
    const fetchURlLocal = !!repository.remote ? repository.remote.fetch : null;
    if (!!repository.remote && !!fetchURlLocal) {
      if (credentials) {
        urlRemotes = this.utilities.addCredentialsToRemote(fetchURlLocal, credentials);
      } else {
        urlRemotes = fetchURlLocal;
      }
    } else {
      // retrieve from git
      const listRemotes = await this.git(directory).getRemotes(true);

      let fallbackURLRemotes = '';
      listRemotes.forEach(remoteInfo => {
        if (!!!customRemote && remoteInfo.name === 'origin') {
          if (credentials) {
            urlRemotes = this.utilities.addCredentialsToRemote(remoteInfo.refs.fetch, credentials);
          } else {
            urlRemotes = remoteInfo.refs.fetch;
          }
          fallbackURLRemotes = urlRemotes;
        } else if (remoteInfo.name === customRemote) {
          if (credentials) {
            urlRemotes = this.utilities.addCredentialsToRemote(remoteInfo.refs.fetch, credentials);
          } else {
            urlRemotes = remoteInfo.refs.fetch;
          }
        }
      });

      if (!urlRemotes && !fallbackURLRemotes) {
        return false;
      }

      if (!urlRemotes) {
        urlRemotes = fallbackURLRemotes;
      }
    }
    // const urlRemote = this.utilities.addCredentialsToRemote(cloneURL, credentials);
    const data = await this.git(directory).fetch(urlRemotes);
    return {
      fetchData: data,
      repository
    };
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
