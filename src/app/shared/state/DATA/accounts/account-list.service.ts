import { Injectable } from '@angular/core';
import { AccountListStore } from './account-list.store';
import { Account } from './account-list.model';
import { AccountListQuery } from './account-list.query';
import { AppConfig } from '../../../model/App-Config';
import { SecurityService } from '../../../../services/system/security.service';
import { DataService } from '../../../../services/features/core/data.service';
import { FileSystemService } from '../../../../services/system/fileSystem.service';

@Injectable({ providedIn: 'root' })
export class AccountListService {

  constructor(
    protected store: AccountListStore,
    protected query: AccountListQuery,
    private security: SecurityService,
    private dataService: DataService,
    private fsService: FileSystemService
  ) {
  }

  set(arrData: Account[]) {
    this.store.set(arrData);
  }

  add(arrData: Account) {
    this.store.add(arrData, { prepend: true });
  }

  getAsync() {
    return this.query.selectAll();
  }

  getSync() {
    return this.query.getAll();
  }

  getOneSync(idAccount: number) {
    return this.query.getEntity(idAccount);
  }

  getOneAsync(idAccount: string) {
    return this.query.selectEntity(idAccount);
  }

  reset() {
    this.store.reset();
  }

  async loadFromDatabase() {
    const machineID = this.security.appUUID;
    const configFile: AppConfig = await this.dataService.getConfigAppData(machineID);
    if (!!!configFile) {
      return;
    }

    const accountsConfig = configFile.account_config;
    const accounts: Account[] = [];
    for (const idAccount of accountsConfig) {
      const account = await this.dataService.getAccountsConfigData(idAccount);
      if (!!account && !!account.account) {
        if (accounts.findIndex(existed => existed.node_id === account.account.node_id) === -1) {
          accounts.push({ ...account.account as Account });
        }
      }
    }
    this.set(accounts);
    return accounts;
  }
}
