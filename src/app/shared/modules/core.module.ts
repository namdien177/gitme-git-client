import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { LocalStorageService } from '../../services/system/localStorage.service';
import { ClickOutSideDirective, OverCountedDirective, ReactiveEllipsisDirective, SimpleEllipsisDirective } from '../directives';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SecurityService } from '../../services/system/security.service';
import { FileSystemService } from '../../services/system/fileSystem.service';
import { UtilityService } from '../utilities/utility.service';

const importModules = [];
const exportModules = [];

const reExportModules = [
  MDBBootstrapModule,
  FormsModule,
  ReactiveFormsModule
];

const providers = [
  LocalStorageService,
  SecurityService,
  FileSystemService,
  UtilityService
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
