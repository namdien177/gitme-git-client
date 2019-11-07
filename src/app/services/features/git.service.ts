import { Injectable } from '@angular/core';
import * as git from 'simple-git/promise';
import { UtilityService } from '../../shared/utilities/utility.service';
import { Account } from '../../shared/state/DATA/account-list';
import { BranchTracking, RepositoryBranchSummary } from '../../shared/state/DATA/repository-branches';
import { Repository, RepositoryRemotes } from '../../shared/state/DATA/repositories';
import { SecurityService } from '../system/security.service';
import * as moment from 'moment';
import { RemoteWithRefs } from 'simple-git/typings/response';
import { FileSystemService } from '../system/fileSystem.service';
import { pathNode } from '../../shared/types/types.electron';

@Injectable()
export class GitService {

  constructor(
    private utilities: UtilityService,
    private securityService: SecurityService,
    private fileSystem: FileSystemService
  ) {
  }

  private static repositoryBranchBuilder(
    oldBranchInstance,
    name: string,
    isCurrent: string | boolean,
    option,
    trackingOn: BranchTracking,
    isRemote: boolean,
    isLocal: boolean
  ): RepositoryBranchSummary {
    return Object.assign(
      {},
      oldBranchInstance,
      { name: name },
      { current: isCurrent },
      { options: option },
      { tracking: trackingOn },
      { has_remote: isRemote },
      { has_local: isLocal }
    );
  }

  /**
   * Retrieve instance of the git repository.
   * @param dir Raw directory, then will be converted to a safer string later.
   */
  gitInstance(dir?: string) {
    dir = this.utilities.directorySafePath(dir);
    return git(dir);
  }

  /**
   * STATUS: DONE
   * Get the name of the repository by looping out from array of paths
   * @param arrayPath
   */
  async getRepositoryName(arrayPath: string[]): Promise<string> {

    if (arrayPath.length === 0) {
      return null;
    }

    const joinPath = arrayPath.slice(0, arrayPath.length - 1).join('/');
    const isGitRepository = await this.gitInstance(joinPath).checkIsRepo();

    if (isGitRepository) {
      return await this.getRepositoryName(arrayPath.slice(0, arrayPath.length - 1));
    } else {
      return arrayPath[arrayPath.length - 1];
    }
  }

  /**
   * STATUS: DONE
   * Get all branches of the repository via directory.
   * @param directory     Working directory
   * @param oldBranches   Retrieve from repository configs
   */
  async getBranchInfo(directory: string, oldBranches: RepositoryBranchSummary[] = []): Promise<RepositoryBranchSummary[]> {
    const branchRemoteRaw = await this.gitInstance(directory).branch(['-r']);
    const branchLocalRaw = await this.gitInstance(directory).branch([]);
    const branchTracking = await this.getBranchTracking(directory);

    if (!branchTracking) {
      return null;
    }

    const branchesOutPut: RepositoryBranchSummary[] = [];

    if (branchRemoteRaw.all.length > branchLocalRaw.all.length) {
      // In case there is no local-only branch.
      Object.keys(branchRemoteRaw.branches).forEach(branchRemoteInstance => {
        const slidedSlash = branchRemoteInstance.split('/');
        const trackingOn = branchTracking.find(track => track.name === slidedSlash[0]);
        const extractedNameRemote = slidedSlash.slice(1).join('/');   // remove origin/
        const existInstanceLocal = branchLocalRaw.all.find(nameLocalBranch => nameLocalBranch === extractedNameRemote);
        if (!!existInstanceLocal && existInstanceLocal.length > 0) {
          const branchItem: RepositoryBranchSummary = GitService.repositoryBranchBuilder(
            branchRemoteRaw.branches[branchRemoteInstance],
            existInstanceLocal,
            branchLocalRaw.branches[existInstanceLocal].current,
            null, trackingOn, true, true
          );
          branchesOutPut.push(branchItem);
        } else {
          const branchItem: RepositoryBranchSummary = GitService.repositoryBranchBuilder(
            branchRemoteRaw.branches[branchRemoteInstance],
            branchRemoteInstance,
            branchRemoteRaw.branches[branchRemoteInstance].current,
            null, trackingOn, true, false
          );
          branchesOutPut.push(branchItem);
        }
      });
    } else {
      // In case there are local-only branch.
      Object.keys(branchLocalRaw.branches).forEach(branchLocalInstance => {
        let trackingOn = null;
        const existRemoteLocal = branchRemoteRaw.all.find(nameRemoteBranch => {
          const slidedSlash = nameRemoteBranch.split('/');
          trackingOn = branchTracking.find(track => track.name === slidedSlash[0]);
          const extractedNameRemote = slidedSlash.slice(1).join('/');   // remove origin/
          return branchLocalInstance === extractedNameRemote;
        });
        if (!!existRemoteLocal && existRemoteLocal.length > 0) {
          const branchItem: RepositoryBranchSummary = GitService.repositoryBranchBuilder(
            branchRemoteRaw.branches[existRemoteLocal],
            branchLocalInstance,
            branchLocalRaw.branches[branchLocalInstance].current,
            null, trackingOn, true, true
          );
          branchesOutPut.push(branchItem);
        } else {
          const branchItem: RepositoryBranchSummary = GitService.repositoryBranchBuilder(
            branchRemoteRaw.branches[existRemoteLocal],
            branchLocalInstance,
            branchLocalRaw.branches[branchLocalInstance].current,
            null, trackingOn, false, true
          );
          branchesOutPut.push(branchItem);
        }
      });
    }

    // update from oldBranch
    if (branchesOutPut.length > oldBranches.length) {
      branchesOutPut.forEach((branch, index, selfArr) => {
        const findFromOld = this.findBranchFromListBranch(branch, oldBranches);

        if (findFromOld) {
          selfArr[index].id = findFromOld.id;
          selfArr[index].last_update = findFromOld.last_update;
          selfArr[index].options = findFromOld.options;
        } else {
          selfArr[index].id = this.securityService.randomID;
          selfArr[index].last_update = null;
          selfArr[index].options = null;
        }
      });
    } else {
      oldBranches.forEach((branch, index, selfArr) => {
        const findFromNew = this.findBranchFromListBranch(branch, branchesOutPut);

        if (findFromNew) {
          findFromNew.id = selfArr[index].id;
          findFromNew.last_update = selfArr[index].last_update;
          findFromNew.options = selfArr[index].options;
        } else {
          // do nothing, will be removed as both local and remote cannot be found
          // This can be due to branch removed, renamed, etc.
        }
      });
    }

    return branchesOutPut;
  }

  async cloneTo(cloneURL: string, directory: string, credentials?: Account) {
    let urlRemote = cloneURL;
    directory = directory + this.utilities.repositoryNameFromHTTPS(cloneURL);
    if (credentials) {
      urlRemote = this.utilities.addCredentialsToRemote(cloneURL, credentials);
    }
    return git().clone(urlRemote, directory);
  }

  async getRemotes(repository: Repository) {
    return await this.gitInstance(repository.directory).getRemotes(true);
  }

  async updateRemotesRepository(repository: Repository, branches: RepositoryBranchSummary[]) {
    const remoteList: RemoteWithRefs[] = await this.getRemotes(repository);
    const updateRepository = { ...repository };
    const remoteRepositoryReturn: RepositoryRemotes[] = [];
    const remoteBranchesReturn: RepositoryBranchSummary[] = [];
    if (!this.isRemoteAvailable(repository)) {
      updateRepository.remote = [];
    }

    let activeBranchRetrieve = null;

    remoteList.forEach(remote => {
      const branchExisted = branches.find(branch => branch.name === remote.name);
      const id: string = !!branchExisted ? branchExisted.id : this.securityService.randomID;
      const newRemote = {
        id,
        name: remote.name,
        fetch: remote.refs.fetch,
        push: remote.refs.push,
      };
      remoteRepositoryReturn.push(newRemote);
      remoteBranchesReturn.push({
        id,
        commit: branchExisted ? branchExisted.commit : null,
        label: branchExisted ? branchExisted.label : null,
        name: branchExisted ? branchExisted.name : remote.name,
        current: branchExisted ? branchExisted.current : false
      });

      if (!!branchExisted && branchExisted.current) {
        activeBranchRetrieve = branchExisted.id;
      }
    });

    updateRepository.remote = remoteRepositoryReturn;
    return {
      repository: updateRepository,
      branches: remoteBranchesReturn,
      activeBranch: !!activeBranchRetrieve ? activeBranchRetrieve : remoteBranchesReturn[0].id,
    };
  }

  async fetchInfo(repository: Repository, credentials: Account, branch: RepositoryBranchSummary) {
    // retrieve the directory for gitInstance to execute
    const { directory } = repository;
    let urlRemote = branch.tracking.fetch;
    if (!!credentials) {
      urlRemote = this.utilities.addCredentialsToRemote(urlRemote, credentials);
    }
    const data = await this.gitInstance(directory).fetch(urlRemote);
    return {
      fetchData: data,
      repository
    };
  }

  /**
   * TODO: fetching all remotes, branches and status of current branch. If no branch is selected, default fetching master
   * @param directory
   */
  async getBranchTracking(directory: string) {
    const stringRemotes: string = await this.gitInstance(directory).remote(['-v']).then(
      res => !!res ? res : ''
    );
    if (stringRemotes.length < 1) {
      return false;
    }
    /**
     * Each remote will have structure as:
     *  <type>      <url>       <action>
     *  origin      abc.git     pull/fetch
     */
    const remoteArray = stringRemotes.split('\n');
    return this.retrieveBranchTrackingArray(remoteArray);
  }

  async getStatusOnBranch(repository: Repository) {
    return this.gitInstance(repository.directory).status();
  }

  async isGitProject(directory: string) {
    directory = this.utilities.directorySafePath(directory);
    return await git(directory).checkIsRepo();
  }

  /**
   * TODO: checking git issue for more info.
   * @param repository
   * @param branchURL
   * @param credentials
   * @param options
   */
  push(repository: Repository, branchURL: string, credentials: Account, options?: { [o: string]: string }) {
    const urlRemote = this.utilities.addCredentialsToRemote(branchURL, credentials);
    // this.gitInstance(repository.directory).raw(
    //     [
    //         // `${urlRemote}`
    //         'push',
    //         `--repo=${ urlRemote }`,
    //         '--all'
    //     ]
    // ).then(r => console.log(r));
    return this.gitInstance(repository.directory).push().then(() => {
      console.log('push complete');
      return true;
    });
  }

  /**
   * STATUS: DONE
   * Commit changes
   * @param repository    Current active repository
   * @param account       Credentials from repository config (or any source)
   * @param message       Message title when commit
   * @param fileList      List directory of changed files, relative to repo directory
   * @param option        additional option.
   */
  async commit(repository: Repository, account: Account, message: string, fileList?: string[], option?: {
    [properties: string]: string
  }) {
    const instanceGit = await this.gitInstance(repository.directory);
    await instanceGit.addConfig('user.name', account.name_local);
    await instanceGit.addConfig('user.email', account.username);
    return instanceGit.commit(message, fileList, option);
  }

  async revert(repository: Repository, files: string[]) {
    if (files.length === 0) {
      // reset hard
      return this.gitInstance(repository.directory).reset('hard');
    } else {
      return this.gitInstance(repository.directory)
      .checkout(['--', ...files]).then(() => null);
    }
  }

  async revertToCommit(repository: Repository, commitID: string) {

  }

  async getDiffOfFile(repository: Repository, filePath: string) {
    return await this.gitInstance(repository.directory).diff(
      ['--', filePath]
    );
  }

  async addWatch(repository: Repository, fileDir: string[]) {
    return await this.gitInstance(repository.directory).add(fileDir);
  }

  async addStash(repository: Repository, message?: string) {
    if (!message) {
      message = `Stashed at ${ moment().format('YYYY/MM/DD - HH:mm:ss') }`;
    }
    return await this.gitInstance(repository.directory).stash();
  }

  async getListStash(repository: Repository) {
    return await this.gitInstance(repository.directory).stashList();
  }

  async getStash(repository: Repository) {
    return await this.gitInstance(repository.directory).stash([
      'pop'
    ]);
  }

  async switchBranch(repository: Repository, branch: RepositoryBranchSummary, credentials?: Account) {
    if (!this.isGitProject(repository.directory)) {
      return false;
    }

    return await this.gitInstance(repository.directory).checkout(branch.name)
    .then(resolve => true)
    .catch(err => {
      console.log(err);
      return false;
    });
  }

  async isFileIgnored(repository: Repository, ...filePath: string[]) {
    return this.gitInstance(repository.directory)
    .checkIgnore([...filePath]);
  }

  async addToIgnore(repository: Repository, ...relativeFilePath: string[]) {
    // Check if file is already in ignore
    const statusIgnore = await this.isFileIgnored(repository, ...relativeFilePath);
    const addIgnore = [];
    if (statusIgnore.length > 0) {
      const filterNotIgnored = relativeFilePath.filter(path => {
        return !statusIgnore.some(already => already === path);
      });
      addIgnore.push(...filterNotIgnored);
    } else {
      addIgnore.push(...relativeFilePath);
    }

    // Check if file ignore is already exist
    const rootIgnore = pathNode.join(repository.directory, '.gitignore');
    const concatPath = '\n' + relativeFilePath.join('\n');
    if (this.fileSystem.isFileExist(rootIgnore)) {
      // File already exist => write to file
      return await this.fileSystem.quickAppendStringTo(rootIgnore, '', concatPath);
    } else {
      // Create file .gitignore
      const createStatus = await this.fileSystem.createFile('.gitignore', concatPath, repository.directory, '', false);
      return createStatus.status;
    }
  }

  isRemoteAvailable(repository: Repository) {
    return !!repository.remote;
  }

  isFetchRemoteAvailable(repository: Repository) {
    if (!this.isRemoteAvailable(repository)) {
      return false;
    }
    return !!repository.remote.find(any => any.fetch != null);
  }

  isPullRemoteAvailable(repository: Repository) {
    if (!this.isRemoteAvailable(repository)) {
      return false;
    }
    return !!repository.remote.find(any => any.push != null);
  }

  private findBranchFromListBranch(branchToFind: RepositoryBranchSummary, listBranch: RepositoryBranchSummary[]) {
    return listBranch.find(remoteBranch => {
      // remote type, has origin/
      const extractedNameOutput = remoteBranch.has_local ? remoteBranch.name : () => {
        const slidedSlashOutput = remoteBranch.name.split('/');
        return slidedSlashOutput.slice(1).join('/');   // remove origin/
      };
      const extractedNameOld = branchToFind.has_local ? branchToFind.name : () => {
        const slidedSlashOld = branchToFind.name.split('/');
        return slidedSlashOld.slice(1).join('/');   // remove origin/
      };
      return extractedNameOld === extractedNameOutput;
    });
  }

  /**
   * Splitting raw string of remotes to branchTracking object array.
   * @param arrayStringRemote
   */
  private retrieveBranchTrackingArray(arrayStringRemote: string[]) {
    const branchTracking: BranchTracking[] = [];

    arrayStringRemote.forEach(remoteRaw => {
      if (remoteRaw.trim().length > 0) {
        const components = remoteRaw.split(/[\s\t]/g);
        const existedData = branchTracking.find(track => track.name === components[0]);
        const action = components[2].slice(1, components[2].length - 1);
        if (existedData) {
          if (action === 'push') {
            existedData.push = components[1];
          } else {
            existedData.fetch = components[1];
          }
        } else {
          branchTracking.push({
            name: components[0],
            fetch: action === 'fetch' ? components[1] : null,
            push: action === 'push' ? components[1] : null
          });
        }
      }
    });

    return branchTracking;
  }

  private getURLRemoteFromListGitRemotes(remoteInfo: {
    refs: {
      fetch: string;
      push: string;
    },
    [key: string]: any
  }, credentials?: Account) {
    if (credentials) {
      return this.utilities.addCredentialsToRemote(remoteInfo.refs.fetch, credentials);
    } else {
      return remoteInfo.refs.fetch;
    }
  }
}
