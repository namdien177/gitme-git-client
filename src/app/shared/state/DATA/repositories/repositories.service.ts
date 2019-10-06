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
     * Create new repository and add to local file config
     * @param newRepository
     * @param credentials
     * @param isNewAccount
     */
    async newRepository(newRepository: Repository, credentials: Account, isNewAccount: boolean = true) {
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

    // TODO: Load all repositories from config
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

    add(arrData: Repository) {
        this.store.add(arrData, { prepend: true });
    }

    set(arr: Repository[]) {
        this.store.set(arr);
    }

    setActive(activeRepository: Repository) {
        this.store.setActive(activeRepository.id);
        this.localStorageService.set(DefineCommon.CACHED_WORKING_REPO, activeRepository.id);
    }

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

    fetch(repository: Repository, option?: { [git: string]: string }) {
        // get account
        const credential: Account = this.accountListService.getOneSync(
            repository.credential.id_credential
        );
        // update timestamp
        repository.timestamp = moment().valueOf();
        return fromPromise(
            this.gitService.fetchInfo(repository, credential)
            .then(
                res => {
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

        const statusUpdate: {
            status: boolean
            repository: Repository
            directory: string
        }[] = [];

        for (const repository of repositories) {
            if (repository.id === repositoryUpdate.id) {
                const status = await this.dataService.updateRepositoryData(repositoryUpdate);
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

            if (!!repos && !!repos.repository && repos.repository.length > 0) {
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
