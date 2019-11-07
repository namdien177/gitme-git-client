import { FileStatusSummary } from '../../../model/FileStatusSummary';

export interface FileChange extends FileStatusSummary {
  is_selected: boolean;
  git_status: FILE_STATUS;
}

export function createFileChange(params: Partial<FileChange>) {
  switch (params.index) {
    case ' ':
    case 'M':

  }
  return { ...params, is_selected: true } as FileChange;
}

export enum FILE_STATUS {
  'NEW',
  'MODIFIED',
  'REMOVED',
  'RENAMED',
  'MOVED',
  'CONFLICTED'
}
