export interface RepositoryBranchSummary {
    id: string;
    commit: string;
    label: string;
    name: string;
    current: boolean;
}

export function createRepositoryBranch(params: Partial<RepositoryBranchSummary>) {
    return {} as RepositoryBranchSummary;
}
