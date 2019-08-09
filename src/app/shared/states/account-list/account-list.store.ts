import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { AccountList } from './account-list.model';

export interface AccountListState extends EntityState<AccountList> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'account-list' })
export class AccountListStore extends EntityStore<AccountListState> {

  constructor() {
    super();
  }

}

