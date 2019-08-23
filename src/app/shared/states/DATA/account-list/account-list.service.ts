import { Injectable } from '@angular/core';
import { AccountListStore } from './account-list.store';
import { Account } from './account-list.model';

@Injectable({ providedIn: 'root' })
export class AccountListService {

    constructor(protected store: AccountListStore) {
    }

    addNew(arrData: Account[]) {
        this.store.add(arrData, { prepend: true });
    }
}
