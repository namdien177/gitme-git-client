import { Injectable } from '@angular/core';
// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { BrowserWindow, ipcRenderer, remote, webFrame } from 'electron';
import { machineIdSync } from 'node-machine-id';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import { LocalStorageService } from './localStorage.service';

@Injectable()
export class ElectronService {

  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  childProcess: typeof childProcess;
  fs: typeof fs;
  os: typeof os;

  private window: BrowserWindow;
  private readonly machine_id: string;

  constructor(
    private localStorage: LocalStorageService
  ) {
    // Conditional imports
    if (this.isElectron()) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.remote = window.require('electron').remote;
      this.window = window.require('electron').remote.getCurrentWindow();

      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');
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
    const keyName = 'uuid';
    if (this.localStorage.isSet(keyName)) {
      this.localStorage.set(keyName, this.machine_id);
    } else {
      if (this.localStorage.get(keyName) !== this.machine_id) {
        // warning first time access
      }
    }
  }
}
