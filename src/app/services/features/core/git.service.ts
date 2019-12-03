import { Injectable } from '@angular/core';
import * as git from 'simple-git/promise';
import * as moment from 'moment';
import { pathNode } from 'app/shared/types/types.electron';

import { UtilityService } from '../../../shared/utilities/utility.service';
import { SecurityService } from '../../system/security.service';
import { FileSystemService } from '../../system/fileSystem.service';
import { BranchTracking, CommitOptions, RepositoryBranchSummary as BranchModel } from '../../../shared/state/DATA/branches';
import { parseDiffCheckResult, parseMergeResult, parseStatusSB } from '../../../shared/utilities/merge-tree-parser';
import { parseBranchRemotes, parseCurrentStatus } from '../../../shared/utilities/utilityHelper';
import { Repository } from '../../../shared/state/DATA/repositories';
import { Account } from '../../../shared/state/DATA/accounts';
import { DefaultLogFields } from '../../../shared/state/DATA/logs';
import { DataService } from './data.service';

@Injectable()
export class GitService {

  constructor(
    private utilities: UtilityService,
    private securityService: SecurityService,
    private fileSystem: FileSystemService,
    private dataSystem: DataService
  ) {
  }

  /**
   * Create a branch instance to store
   */
  static repositoryBranchBuilder(
    oldBranchInstance: Partial<BranchModel | any>,
    name: string, isCurrent: boolean, options: Partial<CommitOptions>,
    trackingOn: BranchTracking, isRemote: boolean, isLocal: boolean,
  ): BranchModel {
    return Object.assign(
      {},
      oldBranchInstance,
      { name: name },
      { current: isCurrent },
      { options: options },
      { tracking: trackingOn },
      { has_remote: isRemote },
      { has_local: isLocal },
    ) as BranchModel;
  }

  /**
   * Retrieve instance of the git repository.
   * @param dir Raw directory, then will be converted to a safer string later.
   */
  gitInstance(dir?: string) {
    if (dir) {
      dir = this.utilities.directorySafePath(dir);
    }
    return git(dir);
  }

  /**
   * Fetch with credentials
   */
  async fetch(repository: Repository, credentials: Account, branch: BranchModel) {
    const { directory } = repository;
    if (!branch.tracking || !branch.tracking.fetch) {
      return {
        fetchData: null,
        repository,
      };
    }
    if (!credentials) {
      credentials = (await this.dataSystem.getAccountsConfigData(repository.credential.id_credential)).account;
    }
    const branchTracking = branch.tracking.name;
    const originalRemote = await this.processingDynamicRemote(
      repository, branch, credentials, 'fetch'
    );
    const data = await this.gitInstance(directory).fetch(branchTracking);
    await this.gitInstance(repository.directory).remote(['set-url', branchTracking, originalRemote]);
    return {
      fetchData: data,
      repository,
    };
  }

  /**
   * Pull new changes from remote with credentials
   */
  async pull(repository: Repository, branch: BranchModel, credentials: Account, options?: { [key: string]: null | string | any }) {
    const originalRemote = await this.processingDynamicRemote(
      repository, branch, credentials, 'fetch'
    );
    const data = await this.gitInstance(repository.directory).pull(
      branch.tracking.name,
      branch.name,
      options,
    );
    await this.gitInstance(repository.directory).remote(['set-url', branch.tracking.name, originalRemote]);
    return data;
  }

  /**
   * TODO: might need to check authorize first
   * Push the commits to remote by credentials and tracking
   */
  async push(repository: Repository, branch: BranchModel, credentials: Account, options?: { [p: string]: null | string | any }) {
    const originalRemote = await this.processingDynamicRemote(repository, branch, credentials, 'push');
    const data = await this.gitInstance(repository.directory).push(
      branch.tracking.name, branch.name, options,
    );
    await this.gitInstance(repository.directory).remote(['set-url', branch.tracking.name, originalRemote]);
    return data;
  }

  /**
   * For pushing new branch to remote
   */
  async pushUpStream(repository: Repository, branch: BranchModel, credentials: Account, options?: { [k: string]: null | string | any }) {
    let defaultOptions = { '-u': null };
    if (options) {
      defaultOptions = Object.assign(defaultOptions, options);
    }
    const trackName = branch.tracking ? branch.tracking.name : 'origin';
    const originalRemote = await this.processingDynamicRemote(repository, branch, credentials, 'push');
    const data = await this.gitInstance(repository.directory).push(
      trackName,
      branch.name,
      defaultOptions,
    );
    await this.gitInstance(repository.directory).remote(['set-url', trackName, originalRemote]);
    return data;
  }

  /**
   * Get the status by running
   * > `git status`
   */
  async status(repository: Repository) {
    return this.gitInstance(repository.directory).status();
  }

  /**
   * Commit changes
   */
  async commit(repository: Repository, message: string, fileList: string[] = [], option?: { [properties: string]: string }) {
    await this.gitInstance(repository.directory).raw(['add', '.']);
    return this.gitInstance(repository.directory).commit(message, fileList, option);
  }

  /**
   * Revert the changes. If passing empty list of file, revert hard will be selected
   */
  async revert(repository: Repository, paths: string[] = []) {
    if (paths.length === 0) {
      // reset hard
      return this.gitInstance(repository.directory).reset('hard');
    } else {
      return this.gitInstance(repository.directory).checkout(['--', ...paths]).then(() => null);
    }
  }

  /**
   * revert a specific commit (that was pushed
   */
  async revertCommit(repository: Repository, commitSHA: string) {
    return this.gitInstance(repository.directory).revert(commitSHA);
  }

  /**
   * Revert commit that was not pushed
   * @param repository
   * @param commitSHA
   * @param totalCommit
   */
  async revertLocalCommit(repository: Repository, commitSHA: string, totalCommit: number = 1) {
    return this.gitInstance(repository.directory)
    .reset([`${ commitSHA }~${ totalCommit }`]);
  }

  /**
   * Clone a remote project
   */
  async cloneTo(cloneURL: string, outerDirectory: string, credentials?: Account) {
    let urlRemote = cloneURL;
    const repositoryName = this.utilities.repositoryNameFromHTTPS(cloneURL);
    if (typeof repositoryName !== 'string') {
      return null;
    }
    outerDirectory = pathNode.join(outerDirectory, repositoryName);
    if (credentials) {
      urlRemote = this.utilities.addOauthTokenToRemote(cloneURL, credentials);
    }
    return git().clone(urlRemote, outerDirectory);
  }

  /**
   * Preview the merge without affecting to the working tree.
   */
  async mergePreview(repository: Repository, branchFrom: BranchModel, branchTo: BranchModel) {
    let baseTree = await this.getMergeBase(repository, branchFrom, branchTo);
    if (baseTree.includes('\n')) {
      baseTree = baseTree.replace(/\n/g, '');
    }
    let nameFrom = branchFrom.name;
    if (!branchFrom.has_local) {
      nameFrom = `${ branchFrom.tracking.name }/${ nameFrom }`;
    }
    const mergeTree = await this.gitInstance(repository.directory).raw([
      'merge-tree', baseTree, branchTo.name, nameFrom
    ]).then(text => text, error => error.toString());
    // let executeCommand = `git merge-tree ${ baseTree } ${ branchTo.name } ${ nameFrom }`;
    // if (executeCommand.includes('\n')) {
    //   executeCommand = executeCommand.replace(/\n/g, '');
    // }
    // const promisifyScript = util.promisify(this.run_script);
    // const mergePreviewRawText = await promisifyScript({
    //   command: executeCommand,
    //   directory: repository.directory,
    // }).then(text => text, error => error.toString());
    return parseMergeResult(mergeTree);
  }

  /**
   * Merge the branch
   */
  async merge(repository: Repository, branchFrom: BranchModel, branchTo: BranchModel, isConflict = false) {
    const defaultMessage = `Merge branch ${ branchFrom.name } to ${ branchTo.name }`;
    let nameFrom = branchFrom.name;
    if (!branchFrom.has_local) {
      nameFrom = `${ branchFrom.tracking.name }/${ nameFrom }`;
    }
    if (isConflict) {
      // merge with --no-ff and --no-commit
      return await this.gitInstance(repository.directory).merge([
        nameFrom, '--no-ff', '-no-commit'
      ]);
    }
    return await this.gitInstance(repository.directory).merge([
      nameFrom, '-m', defaultMessage
    ]);
  }

  /**
   * Abort merge when not fast-forward
   */
  async mergeAbort(repository: Repository) {
    await this.gitInstance(repository.directory).merge(['--abort']);
    return repository;
  }

  /**
   * Continue a merge that has conflict
   * Actually this will resolve the conflicts by a new commit and push to remote.
   * Yes. The concept is just outstanding!
   */
  async mergeContinue(repository: Repository, files: string[], account: Account, branchName?: { from: string, to: string }) {
    let message = '';
    if (!!branchName) {
      const { from, to } = branchName;
      message = `Resolve conflict for merge request from branch ${ from } to ${ to }`;
    } else {
      message = 'Resolve conflict';
    }
    await this.commit(repository, message, files, { '-i': null });
    return repository;
  }

  /**
   * Check if there are "conflict" marker in files
   */
  async checkConflict(repository: Repository, ...filePath: string[]) {
    const options = ['--check'];
    if (filePath.length > 0) {
      options.push(...filePath);
    }
    const stringCheck = await this.gitInstance(repository.directory).diff(options);
    return parseDiffCheckResult(stringCheck);
  }

  /**
   * Get all branches of the repository via directory.
   * @param directory     Working directory
   * @param oldBranches   Retrieve from repository configs
   */
  async getBranches(directory: string, oldBranches: BranchModel[] = []): Promise<BranchModel[]> {
    const branchRemoteRaw = await this.branch(directory, '-r', '-vv');
    const branchLocalRaw = await this.branch(directory, '-vv');
    const branchTracking = await this.getRemoteTracking(directory);
    // Get the tracking status of the current active branch.
    // As we are not able to check status of other work-tree (without checking out to them)
    const rawTrackingStatus = await this.gitInstance(directory).raw(['status', '-sb']);
    const trackingStatus = parseStatusSB(rawTrackingStatus);

    if (!branchTracking) {
      return [];
    }
    const branchesOutPut: BranchModel[] = [];

    // result from remote first
    Object.keys(branchRemoteRaw.branches).forEach(branchRemoteName => {
      // contain [<name tracker>, <name branch>, etc]
      // tracker normally will be origin
      const slidedSlash = branchRemoteName.split('/');
      const trackingOn = branchTracking.find(track => track.name === slidedSlash[0]);
      // get the true name of the branch be hind tracker
      const branchName = slidedSlash.slice(1).join('/');
      // If exist local, copy the current and change the local/remote status
      const existInstanceLocal = branchLocalRaw.all.find(
        nameLocalBranch => nameLocalBranch === branchName,
      );
      let isRemote = true;
      if (trackingStatus.branchName === branchName) {
        isRemote = !!trackingStatus.trackTo;
      }

      if (!!existInstanceLocal) {
        const current = parseCurrentStatus(branchLocalRaw.branches[existInstanceLocal].current);
        const branchItem: BranchModel = GitService.repositoryBranchBuilder(
          branchRemoteRaw.branches[branchRemoteName],
          branchName,
          current, null, trackingOn, isRemote, true,
        );
        branchesOutPut.push(branchItem);
      } else {
        const current = parseCurrentStatus(branchRemoteRaw.branches[branchRemoteName].current);
        const branchItem: BranchModel = GitService.repositoryBranchBuilder(
          branchRemoteRaw.branches[branchRemoteName],
          branchName,
          current, null, trackingOn, isRemote, false,
        );
        branchesOutPut.push(branchItem);
      }
    });

    // Looping all local array to find "local only"
    Object.keys(branchLocalRaw.branches).forEach(branchLocalName => {
      const existedValue = branchesOutPut.find(br => br.name === branchLocalName);
      /**
       * Branch local only will not in remotes
       */
      if (!existedValue) {
        const current = parseCurrentStatus(branchLocalRaw.branches[branchLocalName].current);
        const branchItem: BranchModel = GitService.repositoryBranchBuilder(
          branchLocalRaw.branches[branchLocalName],
          branchLocalName,
          current, null, null, false, true,
        );
        branchesOutPut.push(branchItem);
      }
    });

    // update other information from oldBranch
    branchesOutPut.forEach((branch, index) => {
      const existed = oldBranches.find(ob => ob.name === branch.name);
      if (existed) {
        branchesOutPut[index].id = existed.id;
        branchesOutPut[index].last_update = existed.last_update;
        branchesOutPut[index].options = existed.options;
      } else {
        branchesOutPut[index].id = this.securityService.randomID;
        branchesOutPut[index].last_update = null;
        branchesOutPut[index].options = null;
      }
    });
    return branchesOutPut;
  }

  /**
   * Get the branch by running
   * > `git branch`
   */
  async branch(directory: string, ...options: string[]) {
    return this.gitInstance(directory).branch(options);
  }

  /**
   * Checkout a branch
   */
  async checkoutBranch(repository: Repository, branchName: string, credentials?: Account): Promise<boolean> {
    return this.gitInstance(repository.directory).checkout(branchName)
    .then(() => true)
    .catch(err => {
      console.log(err);
      return false;
    });
  }

  /**
   * Receive the history of commitment.
   */
  async getLogs(repository: Repository, before?: string, options?: { [key: string]: string | null | any }) {
    const optionDefault = { '-20': null };
    if (options) {
      Object.assign(optionDefault, options);
    }
    if (before) {
      Object.assign(optionDefault, { '--before': before });
    }
    return this.gitInstance(repository.directory).log<DefaultLogFields>(optionDefault);
  }

  /**
   * Get the first log ever.
   */
  async getFirstLog(repository: Repository) {
    return this.gitInstance(repository.directory).raw([
      'rev-list', '--max-parents=0', 'HEAD'
    ]);
  }

  /**
   * Show the files in a specific commit
   */
  async showCommit(repository: Repository, ...options: string[]) {
    const optionsPassed: string[] = ['--name-status'];
    if (options && options.length > 0) {
      optionsPassed.push(...options);
    }
    return this.gitInstance(repository.directory).show(optionsPassed);
  }

  /**
   * TODO Filter case where it's the first commit
   * Get the diff of the file in a commit.
   */
  async diffsFromCommit(repository: Repository, filePath: string, commitSHA: string) {
    const lastHash = (await this.getFirstLog(repository)).replace('\n', '').trim();
    let options = [];
    if (lastHash === commitSHA) {
      options = [
        `4b825dc642cb6eb9a060e54bf8d69288fbee4904`, // default empty tree
        `${ commitSHA }`,
        '--',
        `${ filePath }`,
      ];
    } else {
      options = [
        `${ commitSHA }^1`,
        `${ commitSHA }`,
        '--',
        `${ filePath }`,
      ];
    }
    return this.gitInstance(repository.directory).diff(options);
  }

  /**
   * TODO: Investigate special added files
   * Get differences of a file in the current working tree
   */
  async diffs(repository: Repository, filePath: string) {
    return await this.gitInstance(repository.directory).diff(
      ['--', filePath],
    );
  }

  /**
   * Check if the fire are ignored
   */
  async isIgnored(repository: Repository, ...filePath: string[]) {
    return this.gitInstance(repository.directory).checkIgnore([...filePath]);
  }

  /**
   * Add the files to ignore
   */
  async addToIgnore(repository: Repository, ...relativeFilePath: string[]) {
    const rootIgnore = pathNode.join(repository.directory, '.gitignore');
    // Check if file is already in ignore
    const statusIgnore = await this.isIgnored(repository, ...relativeFilePath);
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

  /**
   * Add the extension to ignore
   */
  async addExtensionToIgnore(repository: Repository, ...filePaths: string[]) {
    const rootIgnore = pathNode.join(repository.directory, '.gitignore');
    const extractedExtension: string[] = filePaths.map(path => {
      const fileNode = pathNode.join(repository.directory, path);
      const ext = pathNode.extname(fileNode);
      return `*${ ext }`;
    });
    const extensionJoin: string = '\n' + extractedExtension.join('\n');
    let ignoreStatus: boolean;
    if (!this.fileSystem.isFileExist(rootIgnore)) {
      // File already exist => write to file
      ignoreStatus = (await this.fileSystem.createFile(
        '.gitignore', extensionJoin, repository.directory, '', false,
      )).status;
    } else {
      ignoreStatus = await this.fileSystem.quickAppendStringTo(rootIgnore, '', extensionJoin);
    }
    return ignoreStatus;
  }

  /**
   * TODO: add to stash
   */
  async addStash(repository: Repository, message?: string) {
    if (!message) {
      message = `Stashed at ${ moment().format('YYYY/MM/DD - HH:mm:ss') }`;
    }
    return await this.gitInstance(repository.directory).stash(['-m', message]);
  }

  /**
   * TODO: List of stash
   */
  async getListStash(repository: Repository) {
    return await this.gitInstance(repository.directory).stashList();
  }

  /**
   * TODO: restore the stash
   */
  async getStash(repository: Repository) {
    return await this.gitInstance(repository.directory).stash([
      'pop',
    ]);
  }

  /**
   * Get the remotes tracking information
   */
  async getRemoteTracking(directory: string) {
    const stringRemotes: string = await this.gitInstance(directory).remote(['-v']).then(
      res => !!res ? res : '',
    );
    if (stringRemotes.length < 1) {
      return null;
    }
    /**
     * Each remote will have structure as:
     *  <type>      <url>       <action>
     *  origin      abc.git     pull/fetch
     */
    const remoteArray = stringRemotes.split('\n');
    return parseBranchRemotes(remoteArray);
  }

  /**
   * Check if this is a git project
   */
  async isGitProject(directory: string) {
    directory = this.utilities.directorySafePath(directory);
    return await git(directory).checkIsRepo();
  }

  /**
   * Get the name of the repository by looping out from array of paths
   */
  async getName(paths: string[]): Promise<string> {
    if (paths.length === 0) {
      return null;
    }
    const joinPath = paths.slice(0, paths.length - 1).join('/');
    const isGitRepository = await this.gitInstance(joinPath).checkIsRepo();
    if (isGitRepository) {
      return await this.getName(paths.slice(0, paths.length - 1));
    } else {
      return paths[paths.length - 1];
    }
  }

  /**
   * Get the closest merge base to compare in tree-view
   */
  async getMergeBase(repository: Repository, branchFrom: BranchModel, branchTo: BranchModel) {
    let nameFrom = branchFrom.name;
    if (!branchFrom.has_local) {
      nameFrom = `${ branchFrom.tracking.name }/${ nameFrom }`;
    }
    return this.gitInstance(repository.directory).raw([
      'merge-base',
      nameFrom,
      branchTo.name,
    ]);
  }

  async checkRemote(remote: string, credentials: Account) {
    const remoteOauth = this.utilities.addOauthTokenToRemote(remote, credentials);
    let lsRemote = null;
    try {
      lsRemote = await this.gitInstance().listRemote(['-h', remoteOauth]);
    } catch (e) {
      console.log(e);
    }
    return !!lsRemote;
  }

  private async processingDynamicRemote(repository: Repository, branch: BranchModel, credentials: Account,
                                        mode: 'fetch' | 'push') {
    const trackName = branch.tracking.name;
    let originalRemote = await this.gitInstance(repository.directory).remote(['get-url', trackName]);
    originalRemote = this.utilities.fixRemote(originalRemote, branch.tracking[mode]);
    const remoteFetch = this.utilities.getOAuthRemote(branch, repository, credentials, 'fetch');
    await this.gitInstance(repository.directory).remote(['set-url', trackName, remoteFetch]);
    return originalRemote;
  }
}

