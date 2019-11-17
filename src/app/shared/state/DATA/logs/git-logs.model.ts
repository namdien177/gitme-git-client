export interface ListLogLine {
  author_email: string;
  author_name: string;
  body: string;
  date: string;
  hash: string;
  message: string;
  refs: string;
}

export interface ListLogSummary {
  all: ListLogLine[];
  latest: ListLogLine;
  total: number;
}


export interface DefaultLogFields extends ListLogLine {
  hash: string;
  date: string;
  message: string;
  refs: string;
  body: string;
  author_name: string;
  author_email: string;
}
