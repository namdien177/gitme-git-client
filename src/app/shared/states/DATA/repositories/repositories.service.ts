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
import { AppRepositories } from '../../../model/App-Repositories';
import { SecurityService } from '../../../../services/system/security.service';
import { AppAccounts } from '../../../model/App-Accounts';
import { FileStatusSummary } from '../../../model/FileStatusSummary';
import * as moment from 'moment';

@Injectable({ providedIn: 'root' })
export class RepositoriesService {

    constructor(
        protected store: RepositoriesStore,
        protected query: RepositoriesQuery,
        private gitService: GitService,
        private fileService: FileSystemService,
        private localStorageService: LocalStorageService,
        private accountListService: AccountListService,
        private repositoryBranchesService: RepositoryBranchesService,
        private securityService: SecurityService
    ) {
    }

    // Load all repositories from config
    async load() {
        const machineID = this.securityService.appUUID;
        const configFile: AppConfig = await this.fileService.getFileContext<AppConfig>(
            machineID, DefineCommon.DIR_CONFIG()
        ).then(fulfilled => fulfilled.value);

        if (!!!configFile) {
            return;
        }

        const repositoryFile = configFile.repository_config;
        const repositories: Repository[] = [];
        for (const configName of repositoryFile) {
            const repos = await this.fileService.getFileContext<AppRepositories>(
                configName, DefineCommon.DIR_REPOSITORIES()
            );
            if (!!repos.value && !!repos.value.repositories && repos.value.repositories.length > 0) {
                repos.value.repositories.forEach(repo => repositories.push(repo));
            }
        }

        const previousWorking = this.localStorageService.isAvailable(DefineCommon.CACHED_WORKING_REPO) ?
            this.localStorageService.get(DefineCommon.CACHED_WORKING_REPO) : repositories.length > 0 ?
                repositories[0].id : null;
        if (repositories.length > 0) {
            let findCached = null;
            if (!!previousWorking) {
                findCached = repositories.find(repo => repo.id === previousWorking);
            } else {
                findCached = repositories[0];
            }
            this.setActive(findCached);
        }
        this.set(repositories);
    }

    add(arrData: Repository[]) {
        this.store.add(arrData, { prepend: true });
    }

    set(arr: Repository[]) {
        this.store.set(arr);
    }

    setActive(activeRepository: Repository) {
        this.store.setActive(activeRepository.id);
        this.localStorageService.set(DefineCommon.CACHED_WORKING_REPO, activeRepository.id);
    }

    selectActive(): Observable<Repository> {
        this.setLoading();
        return fromPromise(this.load()).pipe(
            switchMap(() => this.query.selectActive()),
            tap(() => {
                this.finishLoading();
            })
        );
    }

    getActive() {
        return this.query.getActive();
    }

    clearActive() {
        this.store.setActive(null);
    }

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

    commit(repository: Repository, title: string, files: string[], option?: { [git: string]: string }) {
        const { name } = repository.credential;
        const author = !!name ? name : null;
        if (!!option && !!!option['--author'] && author) {
            Object.assign(option, {
                '--author': author
            });
        }
        return fromPromise(
            this.gitService.commit(repository, title, files, option)
        ).pipe(
            tap(() => this.fetch({ ...repository }))
        );
    }

    push(repository: Repository, branches: RepositoryBranchSummary[], option?: { [git: string]: string }) {
        // get account
        const credential: Account = this.accountListService.getOneSync(
            repository.credential.id_credential
        );

        // If the repository does not contain any remote => retrieve a full update
        return fromPromise(this.gitService.updateRemotesRepository(repository, branches)).pipe(
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

    fetch(repository: Repository, option?: { [git: string]: string }) {
        // get account
        const credential: Account = this.accountListService.getOneSync(
            repository.credential.id_credential
        );
        // update timestamp
        repository.timestamp = moment().valueOf();
        return fromPromise(
            this.gitService.fetchInfo(repository, credential).then(
                res => {
                    if (typeof res !== 'boolean') {
                        this.updateExistingRepositoryOnLocalDatabase(res.repository);
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

    addExistingLocalRepository(newRepository: Repository, credentials: Account, isNewAccount: boolean = true) {
        const existingAccounts: Account[] = this.accountListService.getSync();
        existingAccounts.push(credentials);

        if (isNewAccount) {
            return fromPromise(
                /**
                 * Saving new account
                 */
                this.fileService.updateFileContext<AppAccounts>(this.securityService.appUUID, {
                    accounts: existingAccounts
                }, DefineCommon.DIR_ACCOUNTS())
            ).pipe(
                switchMap(status => {
                    if (status.status) {
                        /**
                         * Saving new repository
                         */
                        return fromPromise(
                            this.addNewRepositoryToLocalDatabase(newRepository)
                        );
                    } else {
                        throw Error(status.message);
                    }
                })
            );
        } else {
            return fromPromise(
                this.addNewRepositoryToLocalDatabase(newRepository)
            );
        }
    }

    async addNewRepositoryToLocalDatabase(repositoryUpdate: Repository) {
        const readRepositoryConfig = await this.getRepositoryInformation(this.securityService.appUUID);
        const repositoryArray: AppRepositories = { ...readRepositoryConfig.value };

        repositoryArray.repositories.push(repositoryUpdate);

        const status = await this.fileService.updateFileContext(
            this.securityService.appUUID, repositoryArray, DefineCommon.DIR_REPOSITORIES()
        );

        // TODO: consider to post-append config location to app-config
        // if (status.status) {
        //     const appConfigData = await this.fileService.getFileContext<AppConfig>(
        //         this.securityService.appUUID, DefineCommon.DIR_REPOSITORIES()
        //     );
        //     const configFileName = this.securityService.appUUID + '.json';
        //     let isExistConfig = false;
        //     appConfigData.value.repository_config.every(config => {
        //         if (config === configFileName) {
        //             isExistConfig = true;
        //         }
        //         return !isExistConfig;
        //     });
        //
        //     if (!isExistConfig) {
        //         appConfigData.value.repository_config.push(configFileName);
        //     }
        //
        //     await this.fileService.updateFileContext<AppConfig>(
        //         this.securityService.appUUID, appConfigData, DefineCommon.DIR_CONFIG()
        //     );
        // }

        await this.load();

        return status;
    }

    async updateExistingRepositoryOnLocalDatabase(repositoryUpdate: Repository) {
        const configFile: AppConfig = await this.getAppConfig();

        const repositoryFileDirectory = configFile.repository_config;
        const repositories: {
            repositories: Repository[],
            fileName: string
        }[] = [];
        repositories.push(...await this.getAllRepositoryFromConfig(repositoryFileDirectory));

        const statusUpdate: {
            status: boolean
            repository: Repository
            directory: string
        }[] = [];

        for (const repository of repositories) {
            let isChanged = false;
            repository.repositories.forEach((repoData, index, originalArray) => {
                if (repoData.id === repositoryUpdate.id) {
                    originalArray[index] = repositoryUpdate;
                    isChanged = true;
                }
            });

            if (isChanged) {
                const saveData: AppRepositories = {
                    repositories: repository.repositories
                };
                const status = await this.fileService.updateFileContext(
                    repository.fileName, saveData, DefineCommon.DIR_REPOSITORIES()
                );
                statusUpdate.push(
                    {
                        status: status.status,
                        repository: repositoryUpdate,
                        directory: DefineCommon.DIR_REPOSITORIES() + repository.fileName + '.json'
                    }
                );
            }
        }

        await this.load();
        return statusUpdate;
    }

    async getRepositoryInformation(directory: string): Promise<{
        status: boolean,
        message: string,
        value: AppRepositories
    }> {
        return await this.fileService.getFileContext<AppRepositories>(
            directory, DefineCommon.DIR_REPOSITORIES()
        );
    }

    async getAllRepositoryFromConfig(repositoryFileDirectory: string[]) {
        const repositories: {
            repositories: Repository[],
            fileName: string
        }[] = [];

        for (const dir of repositoryFileDirectory) {
            const repos = await this.getRepositoryInformation(dir);

            if (!!repos.value && !!repos.value.repositories && repos.value.repositories.length > 0) {
                repositories.push({
                    repositories: repos.value.repositories,
                    fileName: dir
                });
            }
        }

        return repositories;
    }

    async getAppConfig() {
        return await this.fileService.getFileContext<AppConfig>(
            this.securityService.appUUID, DefineCommon.DIR_CONFIG()
        ).then(fulfilled => fulfilled.value);
    }

    getDiffOfFile(repository: Repository, fileStatusSummary: FileStatusSummary) {
        return this.gitService.getDiffOfFile(repository, fileStatusSummary.path).then(res => {
            return res;
        });
    }
}
