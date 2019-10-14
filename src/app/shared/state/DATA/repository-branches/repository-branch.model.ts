export interface RepositoryBranchSummary {
    id: string;
    name: string;
    commit?: string;
    current?: boolean;
    label?: string;
    // additional
    options?: CommitOptions[];
    tracking?: BranchTracking;
    has_remote?: boolean;
    has_local?: boolean;
    last_update?: number;
}

export interface BranchTracking {
    name: string;
    fetch: string;
    push: string;
}

export interface CommitOptions {
    argument?: string;
    value?: string;
}

export function createRepositoryBranch(params: Partial<RepositoryBranchSummary>) {
    return params as RepositoryBranchSummary;
}
