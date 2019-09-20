import { Account } from '../states/DATA/account-list';

export interface AppAccounts {
    accounts: Account[];
}

export function InitializeAccountConfig() {
    return {
        accounts: []
    };
}
