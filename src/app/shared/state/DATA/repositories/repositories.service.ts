import { Injectable } from '@angular/core';
import { RepositoriesStore } from './repositories.store';
import { Repository } from './repository.model';
import { map, switchMap, tap } from 'rxjs/operators';
import { RepositoriesQuery } from './repositories.query';
import { GitService } from '../../../../services/features/git.service';
import { FileSystemService } from '../../../../services/system/fileSystem.service';
import { AppConfig } from '../../../model/App-Config';
import { DefineCommon } from '../../../../common/define.common';
import { LocalStorageService } from '../../../../services/system/localStorage.service';
import { fromPromise } from 'rxjs/internal-compatibility';
import { RepositoryBranchesService, RepositoryBranchSummary } from '../repository-branches';
import { Observable, of } from 'rxjs';
import { Account, AccountListService } from '../account-list';
import { SecurityService } from '../../../../services/system/security.service';
import { FileStatusSummary } from '../../../model/FileStatusSummary';
import * as moment from 'moment';
import { DataService } from '../../../../services/features/data.service';
import { SystemResponse } from '../../../model/system.response';

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
        private repositoryBranchesService: RepositoryBranchesService,
        private securityService: SecurityService
    ) {
    }

    /**
     * STATUS: DONE
     * Create new repository and add to local file config
     * @param newRepository
     * @param credentials
     * @param isNewAccount
     */
    async insertNewRepository(newRepository: Repository, credentials: Account, isNewAccount: boolean = true) {
        const systemDefaultName = this.securityService.appUUID;
        if (isNewAccount) {
            // Save the new credential to file store;
            const storeNewAccount = this.dataService.createAccountData(credentials, systemDefaultName);
            if (!storeNewAccount) {
                return { status: false, message: 'Unable to update new account information', value: null } as SystemResponse;
            }
        }

        const statusSave = await this.saveToDatabase(newRepository);

        if (statusSave.status) {
            await this.load();
        }

        return statusSave;
    }

    /**
     * STATUS: DONE
     * Load all the repository configs in all local json file
     */
    async load() {
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
                repositories.push(repos.repository);
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
        this.store.setActive(activeRepository.id);
        this.localStorageService.set(DefineCommon.CACHED_WORKING_REPO, activeRepository.id);
    }

    /**
     * STATUS: DONE
     * Retrieving the activating repository. The observable will always return a single repository
     * @param initLoad If set to True (default), it will load from disk first.
     * Should set this to false to save disk performance.
     */
    selectActive(initLoad: boolean = true): Observable<Repository> {
        if (!initLoad) {
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
        return fromPromise(
            this.load()
        ).pipe(
            switchMap(() => this.query.selectActive()),
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

    /**
     * STATUS: DONE
     * Remove the active state.
     */
    clearActive() {
        this.store.setActive(null);
    }

    /**
     * STATUS: NOT DONE
     * TODO: need check
     * Checkout other branch.
     * @param repo
     * @param branch
     */
    checkoutBranch(repo: Repository, branch: RepositoryBranchSummary) {
        this.setLoading();
        return fromPromise(this.gitService.switchBranch(repo, branch))
        .pipe(
            map(status => {
                this.finishLoading();
                return status;
            })
        );
    }

    getBranchStatus(repository: Repository, setLoading = true) {
        if (setLoading) {
            this.setLoading();
        }
        return fromPromise(this.gitService.getStatusOnBranch(repository))
        .pipe(
            map(status => {
                if (setLoading) {
                    this.finishLoading();
                }
                return status;
            })
        );
    }

    /**
     * TODO: checking author, timestamp and re-update the branches configs.
     * @param repository
     * @param title
     * @param files
     * @param option
     */
    commit(repository: Repository, title: string, files: string[], option?: { [git: string]: string }) {
        const { id_credential } = repository.credential;
        const authorDB = this.accountListService.getSync().find(account => account.id === id_credential);
        const activeBranch = this.repositoryBranchesService.getActive();
        return fromPromise(
            this.gitService.commit(repository, authorDB, title, files, option)
        ).pipe(
            tap(() => this.fetch({ ...repository }, activeBranch))
        );
    }

    push(repository: Repository, branches: RepositoryBranchSummary[], option?: { [git: string]: string }) {
        // get account
        const credential: Account = this.accountListService.getOneSync(
            repository.credential.id_credential
        );

        // If the repository does not contain any remote => retrieve a full update
        return fromPromise(
            this.gitService.updateRemotesRepository(repository, branches)
        )
        .pipe(
            switchMap(updateData => {
                repository = updateData.repository;
                branches = updateData.branches;
                const activeBranch = updateData.branches.find(branch => branch.id === updateData.activeBranch);

                this.repositoryBranchesService.set(branches);
                this.repositoryBranchesService.setActiveID(updateData.activeBranch);
                const retrieveBranchRemotePush = repository.remote.find(remote => remote.id === updateData.activeBranch);

                return of({
                    pushURL: retrieveBranchRemotePush.push,
                    branchName: activeBranch.name
                });
            }),
            switchMap(status => {
                if (status.pushURL) {
                    this.gitService.push(repository, status.pushURL, credential, option);
                }
                return of(true);
            }),
            tap(() => this.updateExistingRepositoryOnLocalDatabase(repository)),
        );
    }

    fetch(repository: Repository, branch: RepositoryBranchSummary, option?: { [git: string]: string }) {
        // get account
        const credential: Account = this.accountListService.getOneSync(
            repository.credential.id_credential
        );
        // update timestamp
        repository.timestamp = moment().valueOf();
        console.log(repository);
        return fromPromise(
            this.gitService.fetchInfo(repository, credential, branch)
            .then(
                res => {
                    console.log(res);
                    if (typeof res !== 'boolean') {
                        this.updateExistingRepositoryOnLocalDatabase(res.repository).then(result => console.log(result));
                    }
                    return res;
                }
            )
        );
    }

    getRemotes(repository: Repository) {
        return fromPromise(
            this.gitService.getRemotes(repository)
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
        console.log(repositories);
        const statusUpdate: {
            status: boolean
            repository: Repository
            directory: string
        }[] = [];

        for (const repository of repositories) {
            if (repository.id === repositoryUpdate.id) {
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
        console.log(repositoryFileDirectory);
        for (const fileName of repositoryFileDirectory) {
            const repos = await this.dataService.getRepositoriesConfigData(fileName);
            console.log(repos);
            if (!!repos && !!repos.repository) {
                repositories.push(repos.repository);
            }
        }

        return repositories;
    }

    async getAppConfig(): Promise<AppConfig | null> {
        return await this.dataService.getConfigAppData(this.securityService.appUUID);
    }

    getDiffOfFile(repository: Repository, fileStatusSummary: FileStatusSummary) {
        return this.gitService.getDiffOfFile(repository, fileStatusSummary.path).then(res => {
            return res;
        });
    }
}
