export interface Repository {
    id: string;
    id_remote?: string;
    name?: string;
    name_local?: string;
    directory?: string;
    credential?: RepositoryCredential;
    remote?: RepositoryRemotes[];
    timestamp?: number;

    options?: {
        argument: string
    }[];

    [key: string]: any;
}

export interface RepositoryRemotes {
    id: string;
    name: string;
    fetch: string;
    push?: string;
}

export interface RepositoryCredential {
    id_credential: string;
    name?: string;
}
