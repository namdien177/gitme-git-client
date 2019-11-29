import { Injectable } from '@angular/core';
import { FilesStore } from './files.store';
import { FilesQuery } from './files.query';
import { GitService } from '../../../../services/features/core/git.service';
import { LogFile } from './files.model';

@Injectable({ providedIn: 'root' })
export class FilesService {

  constructor(
    protected store: FilesStore,
    protected query: FilesQuery,
    protected gitService: GitService,
  ) {
  }

  setLogFiles(files: LogFile[]) {
    this.store.set(files);
    this.setLogFileActive(files[0]);
  }

  setLogFileActive(file: LogFile) {
    if (this.query.getActive()) {
      this.store.removeActive(this.query.getActive());
    }
    this.store.setActive(file.path);
  }

  getLogFiles() {
    return this.query.getAll();
  }

  observeLogFiles() {
    return this.query.selectAll();
  }

  getLogFileActive(): LogFile {
    const files = this.query.getActive();
    if (!files) {
      return null;
    }
    if (Array.isArray(files)) {
      return files[0];
    }
    return files;
  }

  observeLogFileActive() {
    return this.query.selectActive();
  }
}
