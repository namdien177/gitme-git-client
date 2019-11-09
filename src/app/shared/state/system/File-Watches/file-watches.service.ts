import { Injectable, OnDestroy } from '@angular/core';
import { FileWatchesStore } from './file-watches.store';
import { chokidarNode, fsNode } from '../../../types/types.electron';
import { FileWatchesQuery } from './file-watches.query';

@Injectable({ providedIn: 'root' })
export class FileWatchesService implements OnDestroy {

  private watcher = null;

  private ignoreDefault = [
    '/node_modules',
    '/.git',
    '/vendor',
    '/.idea',
    '/.project',
    '/.classpath',
    '/.c9',
    '/*.launch',
    '/.settings',
    '/dist',
    '/tmp',
    '/out-tsc',
    '/app-builds',
    '/release',
    '/main.js',
    '/src/**/*.js',
  ];

  constructor(
    private store: FileWatchesStore,
    private query: FileWatchesQuery,
  ) {
  }

  selectChanges() {
    return this.query.select();
  }

  watch(watchingPath: string) {
    this.watcher = chokidarNode.watch(watchingPath, {
      cwd: watchingPath,
      ignored: this.ignoreDefault,
      persistent: true,
      ignoreInitial: true,
      usePolling: false,
      interval: 100,
      binaryInterval: 300,
      alwaysStat: false,
    });

    this.watcher.on(
      'all',
      (
        eventName: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir',
        path: string,
        stats?: typeof fsNode.Stats
      ) => {
        console.log(path);
        this.store.update({
          isChange: true,
          path: path,
          type: eventName,
        });
      });
  }

  async unwatch(emit = false) {
    if (this.watcher) {
      await this.watcher.close();
    }
    this.watcher = false;

    if (emit) {
      this.store.update({
        isChange: null,
        path: null,
        type: null,
      });
    }
  }

  async switchTo(path: string) {
    this.unwatch(true);
    this.watch(path);
  }

  ngOnDestroy(): void {
  }

  private appendPath(path: string) {
    return path + this.ignoreDefault;
  }
}
