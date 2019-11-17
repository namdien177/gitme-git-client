export interface LogFileStatus {
  hash: string;
  author_name: string;
  author_email: string;
  date: string;
  message: string;
  files: LogFile[];
}

export interface LogFile {
  path: string;
  status: FileChangeStatus;
}

export enum FileChangeStatus {
  added = 'A',
  deleted = 'D',
  modified = 'M'
}
