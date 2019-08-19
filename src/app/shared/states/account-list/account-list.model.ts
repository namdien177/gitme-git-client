export interface Account {
  id: string;
  id_remote?: string;
  name_local?: string;
  name_remote?: string;
  avatar_local?: string;
  avatar_remote?: string;
  username: string;
  password: string;
  password_raw?: string;

  [key: string]: any;
}

export function createAccountList(params: Partial<Account>) {
  return {} as Account;
}
