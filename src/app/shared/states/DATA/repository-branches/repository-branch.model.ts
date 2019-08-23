export interface RepositoryBranchSummary {
    id: string;
    commit: string;
    label: string;
    name: string;
    current: boolean | string;
}

export function createRepositoryBranch(params: Partial<RepositoryBranchSummary>) {
    return {} as RepositoryBranchSummary;
}
