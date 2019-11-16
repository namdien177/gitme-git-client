export interface PullResult {

  /** Array of all files that are referenced in the pull */
  files: string[];

  /** Map of file names to the number of insertions in that file */
  insertions: { [key: string]: number };

  /** Map of file names to the number of deletions in that file */
  deletions: any;

  summary: {
    changes: number;
    insertions: number;
    deletions: number;
  };

  /** Array of file names that have been created */
  created: string[];

  /** Array of file names that have been deleted */
  deleted: string[];
}
