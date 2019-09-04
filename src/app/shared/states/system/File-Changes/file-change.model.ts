import { FileStatusSummary } from '../../../model/FileStatusSummary';

export interface FileChange extends FileStatusSummary {
    is_highlighted: boolean;
    git_status: FILE_STATUS;
}

export function createFileChange(params: Partial<FileChange>) {
    return {} as FileChange;
}

export enum FILE_STATUS {
    'NEW',
    'MODIFIED',
    'REMOVED',
    'RENAMED',
    'MOVED',
    'CONFLICTED'
}
