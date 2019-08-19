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
import { RepositoriesService } from '../../shared/states/repositories';
import { AccountListService } from '../../shared/states/account-list';

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
    private fileService: FileSystemService,
    private repositoriesList: RepositoriesService,
    private accountList: AccountListService
  ) {
    // Conditional imports
    if (ElectronService.isElectron()) {
      this.ipcRenderer = electronNG.ipcRenderer;
      this.webFrame = electronNG.webFrame;
      this.remote = electronNG.remote;
      this.window = electronNG.remote.getCurrentWindow();

      this.childProcess = window.require('child_process');
      this.fs = fsNode;
      this.machine_id = machineIdSync();
      this.setupUUID();
      this.initializeDatabase();
      console.log(this.securityService.randomID);
    }
  }

  static isElectron() {
    return window && window.process && window.process.type;
  }

  initializeDatabase() {
    /**
     * Loading the configuration file
     */
    const configDefaultName = this.machine_id;
    if (this.fileService.isFileExist(DefineCommon.ROOT + DefineCommon.DIR_CONFIG(configDefaultName))) {
      // load to memory repos and other settings
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

  closeApplication() {
    this.window.close();
  }

  minimizeApplication() {
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
    fileContext.then(contextStatus => {
      const dataOutput = contextStatus.value;
      if (!!dataOutput.repositories && Array.isArray(dataOutput.repositories)) {
        this.repositoriesList.addNew(dataOutput.repositories);
      }

      if (!!dataOutput.credentials && Array.isArray(dataOutput.credentials)) {
        this.accountList.addNew(dataOutput.credentials);
      }
    });
  }
}
