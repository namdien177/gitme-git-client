import { Injectable } from '@angular/core';
import { createInitialState, FileStatusSummaryView, RepositoryStatusStore } from './repository-status.store';
import { HttpClient } from '@angular/common/http';
import { StatusSummary } from '../../../model/StatusSummary';
import { RepositoryStatusQuery } from './repository-status.query';
import { UtilityService } from '../../../utilities/utility.service';

@Injectable({ providedIn: 'root' })
export class RepositoryStatusService {

    constructor(
        private repositoryStatusStore: RepositoryStatusStore,
        private repositoryStatusQuery: RepositoryStatusQuery,
        private utilityService: UtilityService,
        private http: HttpClient
    ) {
    }

    set(status: StatusSummary) {
        const currentArr = this.repositoryStatusQuery.getValue().files;
        const convertedFileStatus: FileStatusSummaryView[] = status.files.map<FileStatusSummaryView>(
            file => {
                const isCached = this.retrieveExistedCacheFile(currentArr, file.path);
                return {
                    ...file,
                    checked: isCached ? this.retrieveCheckStatusFromCacheFile(isCached) : true,
                    active: false
                };
            }
        );
        this.repositoryStatusStore.update(
            Object.assign(status, { files: convertedFileStatus })
        );
    }

    reset() {
        this.repositoryStatusStore.update(createInitialState());
    }

    select() {
        return this.repositoryStatusQuery.select();
    }

    get() {
        return this.repositoryStatusQuery.getValue();
    }

    toggleCheckbox(indexState: number) {
        const updateState = this.retrieveToggledCheckedArray(indexState);
        this.repositoryStatusStore.update({
            files: updateState.newArrayState
        });
        return updateState;
    }

    toggleActive(indexState: number) {
        this.repositoryStatusStore.update({
            files: this.retrieveToggledActivatedArray(indexState)
        });
    }

    resetActiveState() {
        const mutableArrayState = [...this.repositoryStatusQuery.getValue().files];
        const newMutable = mutableArrayState.map(
            file => <FileStatusSummaryView>Object.assign(
                { ...file },
                { active: false }
            )
        );
        this.repositoryStatusStore.update({
            files: newMutable
        });
    }

    checkAllCheckboxState() {
        const mutableArrayState = [...this.repositoryStatusQuery.getValue().files];
        const newMutable = mutableArrayState.map(
            file => <FileStatusSummaryView>Object.assign(
                { ...file },
                { checked: true }
            )
        );
        this.repositoryStatusStore.update({
            files: newMutable
        });
    }

    uncheckAllCheckboxState() {
        const mutableArrayState = [...this.repositoryStatusQuery.getValue().files];
        const newMutable = mutableArrayState.map(
            file => <FileStatusSummaryView>Object.assign(
                { ...file },
                { checked: false }
            )
        );
        this.repositoryStatusStore.update({
            files: newMutable
        });
    }

    private retrieveExistedCacheFile(arrayToFind: FileStatusSummaryView[], pathToFind: string) {
        return arrayToFind.find(fileExisted => fileExisted.path === pathToFind);
    }

    private retrieveCheckStatusFromCacheFile(file: FileStatusSummaryView) {
        if (file && file.checked === false) {
            return file.checked;
        }

        return true;
    }

    private retrieveToggledCheckedArray(index: number) {
        const immutableState = this.repositoryStatusQuery.getValue().files;
        const mutableState = [...immutableState];
        const newState = Object.assign({
            ...mutableState[index],
            checked: !mutableState[index].checked
        });
        mutableState[index] = newState;
        return {
            newArrayState: mutableState,
            oldArrayState: immutableState,
            oldItemState: mutableState[index],
            newItemState: newState
        };
    }

    private retrieveToggledActivatedArray(index: number) {
        const mutableState = [...this.repositoryStatusQuery.getValue().files];
        mutableState[index] = Object.assign({
            ...mutableState[index],
            active: !mutableState[index].active
        });
        return mutableState;
    }
}
