import { Account } from '../state/DATA/account-list';

export interface AppAccounts {
  account: Account;
}

export function InitializeAccountConfig(account: Account) {
  return {
    account: account
  } as AppAccounts;
}
