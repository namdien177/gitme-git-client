import { Injectable } from '@angular/core';
// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { BrowserWindow, ipcRenderer, remote, webFrame } from 'electron';
import { machineIdSync } from 'node-machine-id';
import * as childProcess from 'child_process';
import * as os from 'os';
import { LocalStorageService } from './localStorage.service';
import { electronNG, fsNode } from '../../shared/types/types.electron';
import { SecurityService } from './security.service';
import { FileSystemService } from './fileSystem.service';
import { DefineCommon } from '../../common/define.common';
import * as moment from 'moment';

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
    private localStorage: LocalStorageService,
    private securityService: SecurityService,
    private fileService: FileSystemService
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
      this.initializeDatabase();
    }
  }

  initializeDatabase() {
    /**
     * Loading the configuration file
     */
    const configDefaultName = this.machine_id;
    if (this.fileService.isFileExist(DefineCommon.DIR_CONFIG(configDefaultName))) {
      // load to memory
      console.log('Loading config from local machine');
      this.setupApplicationConfiguration(
        this.fileService.getFileContext(
          configDefaultName,
          DefineCommon.DIR_CONFIG()
        )
      );
    } else {
      const data = {
        app_key: this.machine_id,
        version: DefineCommon.APP_VERSION,
        first_init: {
          created_at: moment().valueOf()
        },
        repositories: [],
        credentials: []
      };
      this.fileService.createFile(configDefaultName, data, DefineCommon.DIR_CONFIG()).then(
        resolve => {
          console.log(resolve);
        }, reject => {
          console.log(reject);
        }
      );
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
    if (!this.localStorage.isAvailable(DefineCommon.ELECTRON_APPS_UUID_KEYNAME)) {
      // warning first time access
      console.warn('First time accessing application!');
      console.warn('Automatically retrieve UUID machine');
      this.localStorage.set(DefineCommon.ELECTRON_APPS_UUID_KEYNAME, this.machine_id);
    } else {
      if (this.localStorage.get(DefineCommon.ELECTRON_APPS_UUID_KEYNAME) !== this.machine_id) {
        // warning sign in from unknown machine
        console.warn('Detecting unknown machine!');
        console.warn('Automatically retrieve and replace current UUID machine');
        this.localStorage.set(DefineCommon.ELECTRON_APPS_UUID_KEYNAME, this.machine_id);
      }
    }
  }

  private setupApplicationConfiguration(fileContext: Promise<{ status: boolean; message: string; value: any }>) {

  }
}
