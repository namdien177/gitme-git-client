export interface Account {
    id: string;
    id_remote?: string;
    name_local: string;
    name_remote?: string;
    avatar_local?: string;
    avatar_remote?: string;
    username: string;
    password: string;

    [key: string]: any;
}

export function createAccountList(params: Partial<Account>) {
    return {} as Account;
}

export function isAccountType(account: object): account is Account {
    return account['id'] !== null &&
        account['name_local'] !== null &&
        account['username'] !== null &&
        account['password'] !== null;
}