import { Injectable, OnDestroy } from '@angular/core';
import { FileWatchesStore } from './file-watches.store';
import { chokidarNode, fsNode } from '../../../types/types.electron';
import { FileWatchesQuery } from './file-watches.query';

@Injectable({ providedIn: 'root' })
export class FileWatchesService implements OnDestroy {

  private chokidar: typeof chokidarNode;
  private watcher: typeof chokidarNode.FSWatcher.prototype = null;

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
    this.chokidar = chokidarNode;
  }

  selectChanges() {
    return this.query.select();
  }

  watch(watchingPath: string) {
    this.watcher = this.chokidar.watch(watchingPath, {
      cwd: watchingPath,
      ignored: this.ignoreDefault,
      persistent: true,
      ignoreInitial: true
    });

    this.watcher.on(
      'all',
      (
        eventName: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir',
        path: string,
        stats?: typeof fsNode.Stats
      ) => {
        this.store.update({
          isChange: true,
          path: path,
          type: eventName,
        });
      });
  }

  unwatch(emit = false) {
    if (this.watcher) {
      this.watcher.close();
    }
    this.watcher = null;

    if (emit) {
      this.store.update({
        isChange: null,
        path: null,
        type: null,
      });
    }
  }

  switchTo(path: string) {
    this.unwatch();
    this.watch(path);
  }

  ngOnDestroy(): void {
  }

  private appendPath(path: string) {
    return path + this.ignoreDefault;
  }
}
