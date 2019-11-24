import { Injectable } from '@angular/core';
import { RepositoryBranchesStore } from './repository-branches.store';
import { RepositoryBranchSummary } from './repository-branch.model';
import { RepositoryBranchesQuery } from './repository-branches.query';
import { GitService } from '../../../../services/features/core/git.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Repository } from '../repositories';
import { fromPromise } from 'rxjs/internal-compatibility';
import { FileStatusSummaryView, RepositoryStatusService } from '../repository-status';
import { Account, AccountListService } from '../accounts';
import { UtilityService } from '../../../utilities/utility.service';
import { FileStatusSummary } from '../../../model/FileStatusSummary';

@Injectable({ providedIn: 'root' })
export class RepositoryBranchesService {

  constructor(
    private store: RepositoryBranchesStore,
    private query: RepositoryBranchesQuery,
    private gitService: GitService,
    private repoStatus: RepositoryStatusService,
    private accountService: AccountListService,
    private utilities: UtilityService
  ) {
  }

  /**
   * STATUS: DONE
   * Load branches information of a repository.
   * @param repository
   */
  async updateAll(repository: Repository) {
    const repoSum = await this.gitService.getBranches(repository.directory, repository.branches);
    this.set(repoSum);
    return repoSum;
  }

  /**
   * STATUS: DONE
   * Checkout other branch.
   * @param repo
   * @param branch
   */
  async checkoutBranch(repo: Repository, branch: RepositoryBranchSummary) {
    return this.gitService.checkoutBranch(repo, branch.name);
  }

  /**
   * STATUS: DONE
   * @param repository
   * @param files
   */
  async revertFiles(repository: Repository, files: FileStatusSummaryView[]) {
    const dirList = files.map(file => file.path);
    return this.gitService.revert(repository, dirList);
  }

  /**
   * Status: Done
   * @param repository
   * @param files
   */
  async ignoreFiles(repository: Repository, ...files: FileStatusSummaryView[]) {
    const dir = files.map(file => file.path);
    return this.gitService.addToIgnore(repository, ...dir);
  }

  /**
   * Status: Done
   * @param repository
   * @param files
   */
  async ignoreExtension(repository: Repository, ...files: FileStatusSummaryView[]) {
    const dir = files.map(file => file.path);
    return this.gitService.addExtensionToIgnore(repository, ...dir);
  }

  /**
   *
   * @param repository
   * @param branchName
   * @param fromBranch
   */
  newBranchFrom(repository: Repository, branchName: string, fromBranch?: string) {
    let fromBranchName = '';
    if (fromBranch) {
      fromBranchName = fromBranch;
      return fromPromise(
        this.gitService.gitInstance(repository.directory)
        .checkoutBranch(branchName, fromBranchName)
      ).pipe(map(_ => true));
    }
    return fromPromise(
      this.gitService.gitInstance(repository.directory)
      .checkoutLocalBranch(branchName)
    ).pipe(map(_ => true));
  }

  /**
   * TODO: check this
   * @param repository
   * @param branch
   * @param option
   */
  push(repository: Repository, branch: RepositoryBranchSummary, option?: { [git: string]: string }) {
    // get account
    const credentials: Account = this.accountService.getOneSync(
      repository.credential.id_credential
    );

    if (branch.has_remote) {
      // normal push
      return fromPromise(
        this.gitService.push(repository, branch, credentials)
      );
    } else {
      // perform upstream
      return fromPromise(
        this.gitService.pushUpStream(repository.directory, branch)
      );
    }
  }

  /**
   * Perform a pull request
   * @param repository
   * @param branch
   * @param options
   */
  pull(repository: Repository, branch: RepositoryBranchSummary, options?: { [git: string]: string }) {
    // get account
    const credentials: Account = this.accountService.getOneSync(
      repository.credential.id_credential
    );

    if (branch.has_remote) {
      // normal push
      return fromPromise(
        this.gitService.pull(repository, branch, credentials, options)
      );
    } else {
      return of(null);
    }
  }

  /**
   * TODO: check message and re-stash
   * @param repository
   * @param message
   */
  stashChanges(repository: Repository, message?: string) {
    return fromPromise(
      this.gitService.addStash(repository, message)
    );
  }

  async deleteBranch(repository: Repository, branch: RepositoryBranchSummary, force: boolean = true) {
    //  $ git push -d <remote_name> <branch_name>       <---- Delete remotely
    //  $ git branch -d <branch_name>                   <---- Delete locally
    const args = force ? '-D' : '-d';
    const argsRemote = { '-d': null };

    const removeStatus = {
      local: null,
      remote: null
    };
    const masterBranch = repository.branches.find(branchStored => branchStored.name === 'master');
    if (!masterBranch || masterBranch.name === branch.name) {
      // prevent deleting master branch
      return removeStatus;
    }

    if (branch.has_remote) {
      // get account
      const credentials: Account = this.accountService.getOneSync(
        repository.credential.id_credential
      );

      removeStatus.remote = await this.gitService.push(
        repository,
        branch,
        credentials,
        argsRemote
      );
    }

    if (branch.has_local) {
      // delete on local
      // Require to checkout first => default checkout to master
      const switchBranchStatus = await this.gitService.checkoutBranch(repository, masterBranch.name);
      if (!switchBranchStatus) {
        return removeStatus;
      }
      removeStatus.local = await this.gitService.branch(repository.directory, args, branch.name);
    }

    return removeStatus;
  }

  /**
   * STATUS: DONE
   * Change the name of selected branch
   * @param repository
   * @param branch
   * @param newName
   * @param removeOnRemote
   * @param pushToRemote
   */
  async changeName(
    repository: Repository,
    branch: RepositoryBranchSummary, newName: string,
    removeOnRemote: boolean, pushToRemote: boolean
  ) {
    // git branch -m new-name
    // git push origin old-name -d
    // git push origin -u new-name
    const optionOnLocal = ['-m', `${ newName }`];
    const status = {
      changeName: null,
      removeRemote: null,
      pushRemote: null,
    };

    // get account
    const credentials: Account = this.accountService.getOneSync(
      repository.credential.id_credential
    );

    status.changeName = await this.gitService.branch(repository.directory, ...optionOnLocal);

    if (branch.has_remote) {
      // Only if having remote branch
      if (removeOnRemote) {
        // Delete remote branch then push new branch
        status.removeRemote = await this.gitService.push(
          repository,
          branch,
          credentials,
          ['-d']
        );
      }
    } else {
      if (pushToRemote) {
        status.pushRemote = await this.gitService.pushUpStream(
          repository.directory,
          Object.assign(branch, { name: newName })
        );
      }
    }
    return status;
  }

  async merge(repository: Repository, branchFrom: RepositoryBranchSummary, branchTo?: RepositoryBranchSummary, conflictStatus?: boolean) {
    if (conflictStatus === undefined) {
      const status = await this.gitService.status(repository);
      conflictStatus = status.conflicted.length > 0;
    }

    if (branchTo === undefined) {
      branchTo = this.getActive();
    }

    return this.gitService.merge(repository, branchFrom, branchTo, conflictStatus);
  }

  async continueMerge(repository: Repository, files: FileStatusSummary[]) {
    // get account
    const credentials: Account = this.accountService.getOneSync(
      repository.credential.id_credential
    );
    // Take paths
    const paths: string[] = this.utilities.extractFilePathFromGitStatus(files);
    return fromPromise(
      this.gitService.mergeContinue(repository, paths, credentials)
    );
  }

  getMergeStatus(
    repository: Repository,
    fromBranch: RepositoryBranchSummary, toBranch: RepositoryBranchSummary
  ) {
    return fromPromise(
      this.gitService.mergePreview(repository, fromBranch, toBranch)
    );
  }

  abortMerge(
    repository: Repository
  ) {
    /**
     * TODO: need refresh
     */
    return fromPromise(
      this.gitService.mergeAbort(repository)
    );
  }

  set(listBranch: RepositoryBranchSummary[]) {
    // listBranch.sort(
    //   (branchA, branchB) => {
    //     if (branchA.current) {
    //       return -1;
    //     } else if (branchB.current) {
    //       return 1;
    //     }
    //     return 0;
    //   }
    // );
    listBranch.every(branch => {
      if (branch.current) {
        this.setActive(branch);
        return false;
      }
      return true;
    });
    this.store.set(listBranch);
  }

  select(): Observable<RepositoryBranchSummary[]> {
    return this.query.selectAll();
  }

  get(): RepositoryBranchSummary[] {
    return this.query.getAll();
  }

  selectActive() {
    return this.query.selectActive().pipe(
      map(res => {
        if (Array.isArray(res)) {
          return res[0];
        }

        return res;
      })
    );
  }

  getActive() {
    return this.query.getActive();
  }

  setActive(branch: RepositoryBranchSummary) {
    this.store.setActive(branch.id);
  }

  setActiveID(branchID: string) {
    this.store.setActive(branchID);
  }
}
