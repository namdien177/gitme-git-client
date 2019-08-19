import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { Account } from './account-list.model';

export interface AccountListState extends EntityState<Account> {
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'account-list' })
export class AccountListStore extends EntityStore<AccountListState> {

  constructor() {
    super();
  }

}

