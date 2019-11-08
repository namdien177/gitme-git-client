import { Injectable } from '@angular/core';
import { FileChangesStore } from './file-changes.store';
import { HttpClient } from '@angular/common/http';
import { StatusSummary } from '../../../model/statusSummary.model';

@Injectable({ providedIn: 'root' })
export class FileChangesService {

  constructor(
    private fileChangesStore: FileChangesStore,
    private http: HttpClient
  ) {
  }

  set(summary: StatusSummary) {
    const arrAll = summary.files;
    const arrDeletedDir = summary.deleted;
  }
}
