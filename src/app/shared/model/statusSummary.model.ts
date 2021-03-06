import { FileStatusSummary } from './FileStatusSummary';

export class StatusSummary {
  ahead: number;
  behind: number;
  conflicted: string[];
  created: string[];
  current: string;
  deleted: any[];
  files: FileStatusSummary[];
  modified: string[];
  not_added: string[];
  renamed: any[];
  staged: any[];
  tracking: string;
}
