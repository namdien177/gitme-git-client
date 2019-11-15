import { Injectable } from '@angular/core';
import { AccountListStore } from './account-list.store';
import { Account } from './account-list.model';
import { AccountListQuery } from './account-list.query';

@Injectable({ providedIn: 'root' })
export class AccountListService {

  constructor(
    protected store: AccountListStore,
    protected query: AccountListQuery
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
}
