import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { LocalStorageService } from '../../services/system/localStorage.service';
import { ClickOutSideDirective, OverCountedDirective, ReactiveEllipsisDirective, SimpleEllipsisDirective } from '../directives';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SecurityService } from '../../services/system/security.service';
import { FileSystemService } from '../../services/system/fileSystem.service';
import { UtilityService } from '../utilities/utility.service';
import { GitPackService } from '../../services/features/git-pack.service';
import { CredentialInputComponent } from '../components/credential-input/credential-input.component';
import { CredentialListComponent } from '../components/credential-list/credential-list.component';

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
  UtilityService,
  GitPackService
];

const declareComps = [
  ClickOutSideDirective,
  OverCountedDirective,
  SimpleEllipsisDirective,
  ReactiveEllipsisDirective,
  CredentialInputComponent,
];

@NgModule({
  declarations: [
    ...declareComps,
    CredentialListComponent
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
    ClickOutSideDirective,
    CredentialInputComponent,
    CredentialListComponent
  ]
})
export class CoreModule {
}
