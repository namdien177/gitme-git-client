import { Injectable } from '@angular/core';
import { RepositoriesStore } from './repositories.store';
import { Repository } from './repository.model';
import { map, switchMap } from 'rxjs/operators';
import { RepositoriesQuery } from './repositories.query';
import { GitService } from '../../../../services/features/git.service';
import { FileSystemService } from '../../../../services/system/fileSystem.service';
import { AppConfig } from '../../../model/App-Config';
import { DefineCommon } from '../../../../common/define.common';
import { LocalStorageService } from '../../../../services/system/localStorage.service';
import { fromPromise } from 'rxjs/internal-compatibility';

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
        if (previousWorking && repositories.length > 0) {
            repositories.sort(repo => {
                if (repo.id === previousWorking) {
                    return -1;
                } else {
                    return 1;
                }
            });
        }
        this.set(repositories);
    }

    set(arr: Repository[]) {
        this.store.set(arr);
    }

    selectActive(activeRepository: Repository) {
        this.store.update(activeRepository);
        // this.store.toggleActive(activeRepository);
    }

    getActiveRepository() {
        this.setLoading();
        return fromPromise(this.load()).pipe(
            switchMap(() => this.query.selectAll()),
            map(
                listRepo => {
                    let selected = listRepo.find(repo => repo.selected);
                    if (!selected) {
                        selected = listRepo[0];
                        selected.selected = true;
                    }
                    this.finishLoading();
                    return selected;
                }
            )
        );
    }

    setLoading() {
        this.store.setLoading(true);
    }

    finishLoading() {
        this.store.setLoading(false);
    }
}
