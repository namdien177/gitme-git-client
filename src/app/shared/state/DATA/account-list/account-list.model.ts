export interface Account {
  'id': number;
  'node_id': string;
  'oauth_token': string;
  'avatar_url': string;
  'url': string;
  'email': string;
  'name': string;
  'html_url': string;
  'organizations_url': string;
  'company': string;

  [key: string]: any;
}

export function createAccountList(params: Partial<Account>) {
  return {} as Account;
}

export function isAccountType(account: object): account is Account {
  return account['id'] !== null &&
    account['name'] !== null &&
    account['email'] !== null;
}
