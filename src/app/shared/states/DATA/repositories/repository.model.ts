export interface Repository {
    id: string;
    name: string;
    directory: string;
    credential?: RepositoryCredential;
    remote?: RepositoryRemotes[];
    branchesSummary?: RepositoryBranchSummary[];

    options?: CommitOptions[];
    tags?: CommitTags[];

    timestamp?: number;

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

export interface CommitOptions {
    argument?: string;
    value?: string;
}

export interface CommitTags {
    name: string;
    tracking: string;
}

export interface RepositoryBranchSummary {
    name: string;
    tracking: string;
}
