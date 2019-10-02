import { Account } from '../state/DATA/account-list';

export interface AppAccounts {
    accounts: Account[];
}

export function InitializeAccountConfig() {
    return {
        accounts: []
    };
}
