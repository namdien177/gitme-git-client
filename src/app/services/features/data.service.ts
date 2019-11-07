import { Injectable } from '@angular/core';
import { FileSystemService } from '../system/fileSystem.service';
import { Repository } from '../../shared/state/DATA/repositories';
import { AppRepositories, InitializeRepositoryConfig } from '../../shared/model/App-Repositories';
import { DefineCommon } from '../../common/define.common';
import { AppConfig } from '../../shared/model/App-Config';
import { Account } from '../../shared/state/DATA/account-list';
import { AppAccounts, InitializeAccountConfig } from '../../shared/model/App-Accounts';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private fileSystemService: FileSystemService
  ) {
  }

  async getConfigAppData(fileName: string): Promise<AppConfig> {
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

  async getRepositoriesConfigData(idRepository: string): Promise<AppRepositories> {
    if (this.fileSystemService.isFileExist(DefineCommon.ROOT + DefineCommon.DIR_REPOSITORIES(idRepository))) {
      return await this.fileSystemService
      .getFileContext<AppRepositories>(idRepository, DefineCommon.DIR_REPOSITORIES())
      .then(val => val.status ? val.value : null)
      .catch(err => {
        console.log(err);
        return null;
      });
    }

    return null;
  }

  async getAccountsConfigData(idAccount: string): Promise<AppAccounts> {
    if (this.fileSystemService.isFileExist(DefineCommon.ROOT + DefineCommon.DIR_ACCOUNTS(idAccount))) {
      return await this.fileSystemService
      .getFileContext<AppAccounts>(idAccount, DefineCommon.DIR_ACCOUNTS())
      .then(val => val.status ? val.value : null)
      .catch(err => {
        console.log(err);
        return null;
      });
    }

    return null;
  }

  /**
   * Create new account json file.
   * @param account   New account information. Account's id will be used as filename
   * @param idFile    id of application configuration
   */
  async createAccountData(account: Account, idFile: string): Promise<boolean> {
    // prepare system config file
    const systemAppConfig: AppConfig = await this.fileSystemService
    .getFileContext<AppConfig>(idFile, DefineCommon.DIR_CONFIG())
    .then(val => val.value)
    .catch(err => null);

    if (!systemAppConfig) {
      return false;
    }

    if (!this.fileSystemService.isFileExist(DefineCommon.ROOT + DefineCommon.DIR_ACCOUNTS(account.id))) {
      // file does not exist => create the file
      const defaultRepositoryConfig: AppAccounts = InitializeAccountConfig(account);
      const createStatus = await this.fileSystemService
      .createFile(account.id, defaultRepositoryConfig, DefineCommon.DIR_ACCOUNTS());

      if (!createStatus.status) {
        return false;
      }
    } else {
      const statusUpdate = await this.updateAccountData(account, true);
      if (!statusUpdate) {
        return false;
      }
    }

    if (systemAppConfig.account_config.find(data => data === account.id)) {
      // somehow already had the config
      return true;
    }
    systemAppConfig.account_config.push(account.id);
    return await this.updateAppConfigFile(systemAppConfig, idFile).then(async updateStatus => {
      if (!updateStatus) {
        await this.fileSystemService.removeFile(DefineCommon.ROOT + DefineCommon.DIR_ACCOUNTS(account.id));
      }

      return updateStatus;
    });
  }

  /**
   * Create repository json file.
   * @param repository    New repository information. Repository's id will be used as filename
   * @param idFile        id of application configuration
   */
  async createRepositoryData(repository: Repository, idFile: string): Promise<boolean> {
    // prepare system config file
    const systemAppConfig: AppConfig = await this.fileSystemService
    .getFileContext<AppConfig>(idFile, DefineCommon.DIR_CONFIG())
    .then(val => val.value)
    .catch(err => null);

    if (!systemAppConfig) {
      return false;
    }

    if (!this.fileSystemService.isFileExist(DefineCommon.ROOT + DefineCommon.DIR_REPOSITORIES(repository.id))) {
      // file does not exist => create the file
      const defaultAccountConfig: AppRepositories = InitializeRepositoryConfig(repository);
      const createStatus = await this.fileSystemService
      .createFile(repository.id, defaultAccountConfig, DefineCommon.DIR_REPOSITORIES());

      if (!createStatus.status) {
        return false;
      }
    } else {
      const statusUpdate = await this.updateRepositoryData(repository, true);
      if (!statusUpdate) {
        return false;
      }
    }

    if (systemAppConfig.repository_config.find(data => data === repository.id)) {
      // somehow already had the config
      return true;
    }
    systemAppConfig.repository_config.push(repository.id);
    return await this.updateAppConfigFile(systemAppConfig, idFile).then(async updateStatus => {
      if (!updateStatus) {
        await this.fileSystemService.removeFile(DefineCommon.ROOT + DefineCommon.DIR_REPOSITORIES(repository.id));
      }

      return updateStatus;
    });
  }

  /**
   * Update account information
   * @param account               New account information. Account's id will be used as filename
   * @param isSkipIntegrityCheck  Skip checking exist file for better performance
   */
  async updateAccountData(account: Account, isSkipIntegrityCheck: boolean = false): Promise<boolean> {
    if (!isSkipIntegrityCheck) {
      const AccConfig = this.fileSystemService.isFileExist(DefineCommon.ROOT + DefineCommon.DIR_ACCOUNTS(account.id));
      if (!AccConfig) {
        return false;
      }
    }

    return await this.fileSystemService.updateFileContext<AppAccounts>(account.id, { account }, DefineCommon.DIR_ACCOUNTS()).then(
      resolve => resolve.status
    );
  }

  /**
   * Update repository information
   * @param repository            New repository information. Repository's id will be used as filename
   * @param skipIntegrityCheck    Skip checking exist file for better performance
   */
  async updateRepositoryData(repository: Repository, skipIntegrityCheck: boolean = false): Promise<boolean> {
    if (!skipIntegrityCheck) {
      if (!this.fileSystemService.isFileExist(DefineCommon.ROOT + DefineCommon.DIR_REPOSITORIES(repository.id))) {
        return false;
      }
    }
    return await this.fileSystemService.updateFileContext<AppRepositories>(
      repository.id,
      { repository },
      DefineCommon.DIR_REPOSITORIES()
    ).then(
      resolve => resolve.status
    );
  }

  /**
   * Update repository information
   * @param appConfig     New config information.
   * @param fileName      Config to be overwrite
   */
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
