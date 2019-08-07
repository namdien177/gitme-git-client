import { Injectable } from '@angular/core';
import { fsNode } from '../../shared/types/types.electron';

@Injectable({ providedIn: 'root' })
export class FileSystemService {

  private fs: typeof fsNode;

  constructor() {
    this.fs = fsNode;
  }

  /**
   * check if directory or file exist
   * @param directoryPath absolute path
   */
  isDirectoryExist(directoryPath: string) {

  }
}
