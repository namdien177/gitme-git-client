export interface GitDiffResult {
  addedLines: number;
  deletedLines: number;
  isCombined: boolean;
  isGitDiff: boolean;
  oldName: string;
  newName: string;
  language: string;
  blocks: Block[];
  oldMode?: string;
  newMode?: string;
  deletedFileMode?: string;
  newFileMode?: string;
  isDeleted?: boolean;
  isNew?: boolean;
  isCopy?: boolean;
  isRename?: boolean;
  unchangedPercentage?: number;
  changedPercentage?: number;
  checksumBefore?: string;
  checksumAfter?: string;
  mode?: string;
}

export interface Block {
  oldStartLine: number;
  oldStartLine2?: number;
  newStartLine: number;
  header: string;
  lines: Line[];
}

export interface Line {
  content: string;
  type: string;
  oldNumber: number;
  newNumber: number;
}
