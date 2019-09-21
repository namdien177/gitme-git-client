import { Injectable } from '@angular/core';
import { FileSystemService } from '../system/fileSystem.service';
import { Repository } from '../../shared/states/DATA/repositories';
import { AppRepositories, InitializeRepositoryConfig } from '../../shared/model/App-Repositories';
import { DefineCommon } from '../../common/define.common';
import { AppConfig } from '../../shared/model/App-Config';
import { Account } from '../../shared/states/DATA/account-list';
import { AppAccounts, InitializeAccountConfig } from '../../shared/model/App-Accounts';

@Injectable({
    providedIn: 'root'
})
export class DataService {

    constructor(
        private fileSystemService: FileSystemService
    ) {
    }

    async getConfigAppFromFile(fileName: string): Promise<AppConfig> {
        if (this.fileSystemService.isFileExist(DefineCommon.ROOT + DefineCommon.DIR_CONFIG(fileName))) {
            return await this.fileSystemService
            .getFileContext<AppConfig>(fileName, DefineCommon.DIR_CONFIG())
            .then(val => val.status ? val.value : null)
            .catch(err => {
                console.log(err);
                return null;
            });
        }

        return null;
    }

    async getRepositoriesFromFile(fileName: string): Promise<AppRepositories> {
        if (this.fileSystemService.isFileExist(DefineCommon.ROOT + DefineCommon.DIR_REPOSITORIES(fileName))) {
            return await this.fileSystemService
            .getFileContext<AppRepositories>(fileName, DefineCommon.DIR_REPOSITORIES())
            .then(val => val.status ? val.value : null)
            .catch(err => {
                console.log(err);
                return null;
            });
        }

        return null;
    }

    async getAccountsFromFile(fileName: string): Promise<AppAccounts> {
        if (this.fileSystemService.isFileExist(DefineCommon.ROOT + DefineCommon.DIR_ACCOUNTS(fileName))) {
            return await this.fileSystemService
            .getFileContext<AppAccounts>(fileName, DefineCommon.DIR_ACCOUNTS())
            .then(val => val.status ? val.value : null)
            .catch(err => {
                console.log(err);
                return null;
            });
        }

        return null;
    }

    async addNewAccountToFile(account: Account, fileName: string) {
        if (!this.fileSystemService.isFileExist(DefineCommon.ROOT + DefineCommon.DIR_ACCOUNTS(fileName))) {
            // file does not exist => create the file
            const defaultRepositoryConfig: AppAccounts = InitializeAccountConfig();
            const createStatus = await this.fileSystemService
            .createFile(fileName, defaultRepositoryConfig, DefineCommon.DIR_ACCOUNTS());

            if (!createStatus.status) {
                return null;
            }

            // Add to system config file
            const systemAppConfig: AppRepositories = await this.fileSystemService
            .getFileContext<AppConfig>(fileName, DefineCommon.DIR_CONFIG())
            .then(val => val.value)
            .catch(err => null);
            if (!!!systemAppConfig) {
                await this.fileSystemService.removeFile(DefineCommon.ROOT + DefineCommon.DIR_ACCOUNTS(fileName));
                return null;
            }
        }

        // retrieve account config data
        const systemAccConfig: AppAccounts = await this.fileSystemService
        .getFileContext<AppAccounts>(fileName, DefineCommon.DIR_ACCOUNTS())
        .then(val => val.value)
        .catch(err => null);
        if (!!!systemAccConfig) {
            return null;
        }
        systemAccConfig.accounts.push(account);
        // update back to system config
        return await this.fileSystemService
        .updateFileContext<AppAccounts>(fileName, systemAccConfig, DefineCommon.DIR_ACCOUNTS())
        .then(status => status.status)
        .catch(err => {
            console.log(err);
            return false;
        });
    }

    async updateAccountFile(account: Account, fileName: string): Promise<boolean> {
        const AccConfig = this.fileSystemService.isFileExist(DefineCommon.ROOT + DefineCommon.DIR_ACCOUNTS(fileName));
        if (!AccConfig) {
            return false;
        }

        const fileData: AppAccounts = await this.fileSystemService
        .getFileContext<AppAccounts>(fileName, DefineCommon.DIR_ACCOUNTS())
        .then(resolve => resolve.status ? resolve.value : null);
        if (!fileData) {
            return false;
        }

        fileData.accounts.every((acc, index, currentArray) => {
            if (acc.id === account.id) {
                currentArray[index] = account;
                return false;
            }
            return true;
        });

        return await this.fileSystemService.updateFileContext<AppAccounts>(fileName, fileData, DefineCommon.DIR_ACCOUNTS()).then(
            resolve => resolve.status
        );
    }

    async addNewRepositoryToFile(repository: Repository, fileName: string) {
        if (!this.fileSystemService.isFileExist(DefineCommon.ROOT + DefineCommon.DIR_REPOSITORIES(fileName))) {
            // file does not exist => create the file
            const defaultRepositoryConfig: AppRepositories = InitializeRepositoryConfig();
            const createStatus = await this.fileSystemService
            .createFile(fileName, defaultRepositoryConfig, DefineCommon.DIR_REPOSITORIES());

            if (!createStatus.status) {
                return null;
            }

            // Add to system config file
            const systemAppConfig: AppRepositories = await this.fileSystemService
            .getFileContext<AppConfig>(fileName, DefineCommon.DIR_CONFIG())
            .then(val => val.value)
            .catch(err => null);
            if (!!!systemAppConfig) {
                await this.fileSystemService.removeFile(DefineCommon.ROOT + DefineCommon.DIR_REPOSITORIES(fileName));
                return null;
            }
        }

        // retrieve repository config data
        const systemRepoConfig: AppRepositories = await this.fileSystemService
        .getFileContext<AppRepositories>(fileName, DefineCommon.DIR_REPOSITORIES())
        .then(val => val.value)
        .catch(err => null);
        if (!!!systemRepoConfig) {
            return null;
        }
        systemRepoConfig.repositories.push(repository);
        // update back to system config
        return await this.fileSystemService
        .updateFileContext<AppRepositories>(fileName, systemRepoConfig, DefineCommon.DIR_REPOSITORIES())
        .then(status => status.status)
        .catch(err => {
            console.log(err);
            return false;
        });
    }

    async updateRepositoryFile(repository: Repository, fileName: string): Promise<boolean> {
        if (!this.fileSystemService.isFileExist(DefineCommon.ROOT + DefineCommon.DIR_REPOSITORIES(fileName))) {
            return false;
        }

        const fileData: AppRepositories = await this.fileSystemService
        .getFileContext<AppRepositories>(fileName, DefineCommon.DIR_REPOSITORIES())
        .then(resolve => resolve.status ? resolve.value : null);
        if (!fileData) {
            return false;
        }

        fileData.repositories.every((repo, index, currentArray) => {
            if (repo.id === repository.id) {
                currentArray[index] = repository;
                return false;
            }
            return true;
        });

        return await this.fileSystemService.updateFileContext<AppRepositories>(fileName, fileData, DefineCommon.DIR_REPOSITORIES()).then(
            resolve => resolve.status
        );
    }

    async updateAppConfigFile(appConfig: AppConfig, fileName: string): Promise<boolean> {
        if (!this.fileSystemService.isFileExist(DefineCommon.ROOT + DefineCommon.DIR_CONFIG(fileName))) {
            return false;
        }

        const fileData: AppConfig = await this.fileSystemService
        .getFileContext<AppConfig>(fileName, DefineCommon.DIR_CONFIG())
        .then(resolve => resolve.status ? resolve.value : null);
        if (!fileData) {
            return false;
        }

        Object.assign(fileData, appConfig);
        return await this.fileSystemService.updateFileContext<AppConfig>(fileName, fileData, DefineCommon.DIR_CONFIG()).then(
            resolve => resolve.status
        );
    }
}
