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

@Injectable({ providedIn: 'root' })
export class RepositoriesService {

    constructor(
        protected store: RepositoriesStore,
        protected query: RepositoriesQuery,
        private gitService: GitService,
        private fileService: FileSystemService,
        private localStorageService: LocalStorageService
    ) {
    }

    // Load all repositories from config
    async load() {
        const machineID = this.localStorageService.get(DefineCommon.ELECTRON_APPS_UUID_KEYNAME);
        const configFile: AppConfig = await this.fileService.getFileContext<AppConfig>(
            machineID, DefineCommon.DIR_CONFIG()
        ).then(fulfilled => fulfilled.value);

        const repositories = configFile.repositories;
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

    setLoading() {
        this.store.setLoading(true);
    }

    finishLoading() {
        this.store.setLoading(false);
    }
}
