import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { ElectronService } from '../../services/sysem/electron.service';
import { LocalStorageService } from '../../services/sysem/localStorage.service';
import { ClickOutSideDirective, OverCountedDirective, ReactiveEllipsisDirective, SimpleEllipsisDirective } from '../directives';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const importModules = [];
const exportModules = [];

const reExportModules = [
  MDBBootstrapModule,
  FormsModule,
  ReactiveFormsModule
];

const providers = [
  ElectronService,
  LocalStorageService
];

const declareComps = [
  ClickOutSideDirective,
  OverCountedDirective,
  SimpleEllipsisDirective,
  ReactiveEllipsisDirective
];

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
    ...reExportModules,
    ClickOutSideDirective
  ]
})
export class CoreModule {
}
