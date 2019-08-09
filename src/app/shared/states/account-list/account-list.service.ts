import { Injectable } from '@angular/core';
import { AccountListStore, AccountListState } from './account-list.store';
import { NgEntityService } from '@datorama/akita-ng-entity-service';

@Injectable({ providedIn: 'root' })
export class AccountListService extends NgEntityService<AccountListState> {

  constructor(protected store: AccountListStore) {
    super(store);
  }

}
