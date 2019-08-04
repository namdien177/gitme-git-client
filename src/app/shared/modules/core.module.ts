import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { ElectronService } from '../../services/sysem/electron.service';
import { LocalStorageService } from '../../services/sysem/localStorage.service';

const importModules = [];
const exportModules = [];

const reExportModules = [
  MDBBootstrapModule
];

const providers = [
  ElectronService,
  LocalStorageService
];

const declareComps = [];

@NgModule({
  declarations: [
    ...declareComps
  ],
  imports: [
    CommonModule,
    ...importModules,
    ...reExportModules
  ],
  providers: [
    ...providers
  ],
  exports: [
    ...exportModules,
    ...reExportModules
  ]
})
export class CoreModule {
}
