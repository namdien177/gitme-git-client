import { Injectable } from '@angular/core';
import { RepositoriesStore } from './repositories.store';
import { Repository } from './repository.model';
import { distinctUntilChanged, map, switchMap, takeWhile } from 'rxjs/operators';
import { RepositoriesQuery } from './repositories.query';
import { GitService } from '../../../../services/features/git.service';
import { FileSystemService } from '../../../../services/system/fileSystem.service';
import { AppConfig } from '../../../model/App-Config';
import { DefineCommon } from '../../../../common/define.common';
import { LocalStorageService } from '../../../../services/system/localStorage.service';
import { fromPromise } from 'rxjs/internal-compatibility';
import { RepositoryBranchSummary } from '../branches';
import { Observable } from 'rxjs';
import { Account, AccountListService } from '../accounts';
import { SecurityService } from '../../../../services/system/security.service';
import { FileStatusSummary } from '../../../model/FileStatusSummary';
import * as moment from 'moment';
import { DataService } from '../../../../services/features/data.service';
import { SystemResponse } from '../../../model/system.response';
import { deepEquals, deepMutableObject } from '../../../utilities/utilityHelper';

@Injectable({ providedIn: 'root' })
export class RepositoriesService {

  constructor(
    protected store: RepositoriesStore,
    protected query: RepositoriesQuery,
    private gitService: GitService,
    private dataService: DataService,
    private fileService: FileSystemService,
    private localStorageService: LocalStorageService,
    private accountListService: AccountListService,
    private securityService: SecurityService,
  ) {
  }

  /**
   * STATUS: DONE
   * Create new repository and add to local file config
   * @param newRepository
   * @param credentials
   * @param isNewAccount
   */
  async createNew(newRepository: Repository, credentials: Account, isNewAccount: boolean = true) {
    const systemDefaultName = this.securityService.appUUID;
    if (isNewAccount) {
      // Save the new credential to file store;
      const storeNewAccount = await this.dataService.createAccountData(credentials, systemDefaultName);
      if (!storeNewAccount) {
        return { status: false, message: 'Unable to update new account information', value: null } as SystemResponse;
      }
    } else {
      const existedData = await this.dataService.getAccountsConfigData(credentials.id);
      if (existedData && !deepEquals(existedData, credentials)) {
        // update the account as the info was changed
        const updatedAccount = await this.dataService.updateAccountData(credentials);
        if (!updatedAccount) {
          return { status: false, message: 'Unable to update new account information', value: null } as SystemResponse;
        }
      } else if (!existedData) {
        // somehow was deleted?
        const storeNewAccount = await this.dataService.createAccountData(credentials, systemDefaultName);
        if (!storeNewAccount) {
          return { status: false, message: 'Unable to update new account information', value: null } as SystemResponse;
        }
      }
    }

    const statusSave = await this.saveToDatabase(newRepository);

    if (statusSave.status) {
      await this.loadFromDataBase();

      // adding config to the system
      const config = {
        'user.email': credentials.email,
        'user.name': credentials.name
      };
      await this.addConfig(newRepository, config);
    }

    return statusSave;
  }

  /**
   * STATUS: DONE
   * Load all the repository configs in all local json file
   */
  async loadFromDataBase() {
    const machineID = this.securityService.appUUID;
    const configFile: AppConfig = await this.dataService.getConfigAppData(machineID);
    if (!!!configFile) {
      return;
    }

    const repositoryFile = configFile.repository_config;
    const repositories: Repository[] = [];
    for (const idRepository of repositoryFile) {
      const repos = await this.dataService.getRepositoriesConfigData(idRepository);
      if (!!repos && !!repos.repository) {
        if (this.fileService.isDirectoryExist(repos.repository.directory)) {
          const repository: Repository = { ...repos.repository } as Repository;
          repositories.push(repository);
        }
      }
    }

    const previousWorking = this.localStorageService.isAvailable(DefineCommon.CACHED_WORKING_REPO) ?
      this.localStorageService.get(DefineCommon.CACHED_WORKING_REPO) : repositories.length > 0 ?
        repositories[0].id : null;

    if (repositories.length > 0) {
      let findCached: Repository = null;
      if (!!previousWorking) {
        findCached = repositories.find(repo => repo.id === previousWorking);
        if (!findCached) {
          findCached = repositories[0];
        }
      } else {
        findCached = repositories[0];
      }
      this.setActive(findCached);
    }
    this.set(repositories);
  }

  async updateToDataBase(
    repository: Repository,
    newBranches: RepositoryBranchSummary[]
  ) {
    const mutableData: Repository = deepMutableObject(repository);
    const existingBranchesData = mutableData.branches;

    if (!deepEquals(existingBranchesData, newBranches)) {
      mutableData.branches = newBranches;
    }

    const status = await this.dataService.updateRepositoryData(mutableData, true);
    return status ? mutableData : null;
  }

  /**
   * STATUS: DONE
   * Add a single repository information to state.
   * @param arrData The repository to be added. It will be placed ahead and activated.
   */
  add(arrData: Repository) {
    this.store.add(arrData, { prepend: true });
    this.setActive(arrData);
  }

  /**
   * STATUS: DONE
   * Add a collection of repositories to state.
   * @param arr The collection of config from repositories to be added.
   */
  set(arr: Repository[]) {
    this.store.set(arr);
  }

  /**
   * STATUS: DONE
   * Define the activating repository to be working on. This also override the localStorage for future works.
   * @param activeRepository
   */
  setActive(activeRepository: Repository) {
    const currentActive = this.query.getActive();
    this.store.removeActive(currentActive);
    this.store.setActive(activeRepository.id);
    this.localStorageService.set(DefineCommon.CACHED_WORKING_REPO, activeRepository.id);
  }

  /**
   * STATUS: DONE
   * Retrieving the activating repository. The observable will always return a single repository
   * @param initLoad If set to True (default), it will load from disk first.
   * Should set this to false to save disk performance.
   */
  selectActive(): Observable<Repository> {
    return this.query.selectActive().pipe(
      map(active => {
        if (Array.isArray(active)) {
          return active[0];
        } else {
          return active;
        }
      })
    );
  }

  /**
   * STATUS: DONE
   * Get the current active repository
   */
  getActive(): Repository {
    return this.query.getActive();
  }

  get() {
    return this.query.getAll();
  }

  /**
   * STATUS: DONE
   * Remove the active state.
   */
  clearActive() {
    this.store.setActive(null);
  }

  async addConfig(repository: Repository, configObject: { [configName: string]: string }) {
    const gitConfig = this.gitService.gitInstance(repository.directory);
    Object.keys(configObject).forEach(configName => {
      gitConfig.addConfig(configName, configObject[configName]);
    });

    return gitConfig;
  }

  /**
   * TODO: checking author, timestamp and re-update the branches configs.
   * @param repository
   * @param title
   * @param files
   * @param option
   */
  commit(repository: Repository, title: string, files: string[], option?: { [git: string]: string }) {
    return fromPromise(
      this.gitService.commit(repository, title, files, option)
    );
  }

  /**
   * Fetching data
   * @param repository
   * @param branch
   * @param option
   */
  fetch(repository: Repository, branch: RepositoryBranchSummary, option?: { [git: string]: string }) {
    // get account
    const credential: Account = this.accountListService.getOneSync(
      repository.credential.id_credential
    );
    // update timestamp
    repository.timestamp = moment().valueOf();
    return fromPromise(
      this.gitService.fetchInfo(repository, credential, branch)
    ).pipe(
      takeWhile(shouldValid => !!shouldValid.fetchData),
      distinctUntilChanged(),
      switchMap(res => {
        const saveRepo: Repository = deepMutableObject(res.repository);
        if (!!res.fetchData.remote && res.fetchData.remote.trim().length > 0) {
          saveRepo.branches.forEach((br, index, self) => {
            if (br.name === branch.name) {
              br.has_remote = false;
              br.tracking.fetch = res.fetchData.remote;
              self[index] = br;
            }
          });
        }
        return fromPromise(this.updateExistingRepositoryOnLocalDatabase(saveRepo));
      })
    );
  }

  setLoading() {
    this.store.setLoading(true);
  }

  finishLoading() {
    this.store.setLoading(false);
  }

  reset() {
    this.store.reset();
  }

  async saveToDatabase(repositoryUpdate: Repository) {
    repositoryUpdate.branches = await this.gitService.getBranchInfo(repositoryUpdate.directory);
    const statusUpdate = await this.dataService.createRepositoryData(repositoryUpdate, this.securityService.appUUID);
    return {
      value: repositoryUpdate,
      message: '',
      status: statusUpdate
    } as SystemResponse;
  }

  async updateExistingRepositoryOnLocalDatabase(repositoryUpdate: Repository) {
    const configFile: AppConfig = await this.getAppConfig();

    const repositoryFileDirectory = configFile.repository_config;
    const repositories: Repository[] = await this.getAllRepositoryFromConfig(repositoryFileDirectory);
    const statusUpdate: {
      status: boolean
      repository: Repository
      directory: string
    }[] = [];

    for (const repository of repositories) {
      if (repository.id === repositoryUpdate.id && !deepEquals(repository, repositoryUpdate)) {
        const status = await this.dataService.updateRepositoryData(repositoryUpdate, true);
        statusUpdate.push(
          {
            status: status,
            repository: repositoryUpdate,
            directory: DefineCommon.DIR_REPOSITORIES() + repository.id + '.json'
          }
        );
      }
    }
    return statusUpdate;
  }

  async getAllRepositoryFromConfig(repositoryFileDirectory: string[]) {
    const repositories: Repository[] = [];
    for (const fileName of repositoryFileDirectory) {
      const repos = await this.dataService.getRepositoriesConfigData(fileName);
      if (!!repos && !!repos.repository) {
        repositories.push(repos.repository);
      }
    }

    return repositories;
  }

  async getAppConfig(): Promise<AppConfig | null> {
    return await this.dataService.getConfigAppData(this.securityService.appUUID);
  }

  async getDiffOfFile(repository: Repository, fileStatusSummary: FileStatusSummary) {
    return await this.gitService.getDiffOfFile(repository, fileStatusSummary.path);
  }
}
