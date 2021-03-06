import { Injectable } from '@angular/core';
import { ActiveState, EntityState, EntityStore, StoreConfig } from '@datorama/akita';
import { Account } from './account-list.model';

export interface AccountListState extends EntityState<Account>, ActiveState {
}

const initialState = {
  active: null
};

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'accounts', resettable: true })
export class AccountListStore extends EntityStore<AccountListState, Account> {

  constructor() {
    super(initialState);
  }

}

