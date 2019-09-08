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
import { RepositoryBranchSummary } from '../repository-branches';
import { Observable } from 'rxjs';
import { Account, AccountListService } from '../account-list';
import { AppRepositories } from '../../../model/App-Repositories';

@Injectable({ providedIn: 'root' })
export class RepositoriesService {

    constructor(
        protected store: RepositoriesStore,
        protected query: RepositoriesQuery,
        private gitService: GitService,
        private fileService: FileSystemService,
        private localStorageService: LocalStorageService,
        private accountListService: AccountListService
    ) {
    }

    // Load all repositories from config
    async load() {
        const machineID = this.localStorageService.get(DefineCommon.ELECTRON_APPS_UUID_KEYNAME);
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
    }

    getActive(): Observable<Repository> {
        this.setLoading();
        return fromPromise(this.load()).pipe(
            switchMap(() => this.query.selectActive()),
            tap(() => {
                this.finishLoading();
            })
        );
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
        );
    }

    push(repository: Repository, option?: { [git: string]: string }) {
        // get account
        const credential: Account = this.accountListService.getOneSync(
            repository.credential.id_credential
        );

        return fromPromise(
            this.gitService.push(repository, credential, option)
        );
    }

    fetch(repository: Repository, option?: { [git: string]: string }) {
        // get account
        const credential: Account = this.accountListService.getOneSync(
            repository.credential.id_credential
        );
        return fromPromise(
            this.gitService.fetchInfo(repository, credential)
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
}
