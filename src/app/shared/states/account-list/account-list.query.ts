import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { AccountListStore, AccountListState } from './account-list.store';

@Injectable({ providedIn: 'root' })
export class AccountListQuery extends QueryEntity<AccountListState> {

  constructor(protected store: AccountListStore) {
    super(store);
  }

}
