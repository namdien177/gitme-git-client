export interface AccountList {
  id_local?: number;
  username: string;
  password: string;

  [key: string]: any;
}

export function createAccountList(params: Partial<AccountList>) {
  return {} as AccountList;
}
