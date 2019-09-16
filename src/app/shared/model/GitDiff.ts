export interface GitDiff {
    addedLines: number;
    blocks: GitDiffBlocks[];
    checksumAfter: string;
    checksumBefore: string;
    deletedLines: 1;
    isCombined: boolean;
    isGitDiff: boolean;
    language: string;
    mode: string;
    newName: string;
    oldName: string;
}

export interface GitDiffBlocks {
    header: string;
    lines: DiffBlockLines[];
    newStartLine: string;
    oldStartLine: string;
}

export interface DiffBlockLines {
    content: string;
    newNumber: number;
    oldNumber: number;
    type: 'd2h-del' | 'd2h-cntx' | 'd2h-ins';
}
