import { Injectable } from '@angular/core';
// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { BrowserWindow, ipcRenderer, remote, webFrame } from 'electron';
import { machineIdSync } from 'node-machine-id';
import * as childProcess from 'child_process';
import * as os from 'os';
import { LocalStorageService } from './localStorage.service';
import { ELECTRON_APPS_UUID } from '../../common/define.common';
import { electronNG, fsNode } from '../../shared/types/types.electron';

@Injectable({ providedIn: 'root' })
export class ElectronService {

  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  childProcess: typeof childProcess;
  fs: typeof fsNode;
  os: typeof os;

  private window: BrowserWindow;
  private readonly machine_id: string;

  constructor(
    private localStorage: LocalStorageService
  ) {
    // Conditional imports
    if (this.isElectron()) {
      this.ipcRenderer = electronNG.ipcRenderer;
      this.webFrame = electronNG.webFrame;
      this.remote = electronNG.remote;
      this.window = electronNG.remote.getCurrentWindow();

      this.childProcess = window.require('child_process');
      this.fs = fsNode;
      this.machine_id = machineIdSync();
      this.setupUUID();
    }
  }

  isElectron() {
    return window && window.process && window.process.type;
  }

  closeApplication() {
    console.log('close');
    this.window.close();
  }

  minimizeApplication() {
    console.log('minimize');
    this.window.minimize();
  }

  private setupUUID() {
    if (!this.localStorage.isAvailable(ELECTRON_APPS_UUID)) {
      // warning first time access
      console.warn('First time accessing application!');
      console.warn('Automatically retrieve UUID machine');
      this.localStorage.set(ELECTRON_APPS_UUID, this.machine_id);
    } else {
      if (this.localStorage.get(ELECTRON_APPS_UUID) !== this.machine_id) {
        // warning sign in from unknown machine
        console.warn('Detecting unknown machine!');
        console.warn('Automatically retrieve and replace current UUID machine');
        this.localStorage.set(ELECTRON_APPS_UUID, this.machine_id);
      }
    }
  }
}
