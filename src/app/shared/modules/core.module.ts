import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalStorageService } from '../../services/system/localStorage.service';
import { ClickOutSideDirective, OverCountedDirective, ReactiveEllipsisDirective, SimpleEllipsisDirective } from '../directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SecurityService } from '../../services/system/security.service';
import { FileSystemService } from '../../services/system/fileSystem.service';
import { UtilityService } from '../utilities/utility.service';
import { GitService } from '../../services/features/core/git.service';
import { SmallLoadComponent } from '../components/UI/small-load/small-load.component';
import { MaterialModule } from './material.module';
import { SectionLoadComponent } from '../components/UI/section-load/section-load.component';
import { SharedPipeModule } from '../pipe/shared-pipe.module';
import { GithubApiService } from '../../services/features/github-api.service';

const importModules = [];
const exportModules = [];

const reExportModules = [
  FormsModule,
  ReactiveFormsModule,
  MaterialModule,
  SharedPipeModule
];

const providers = [
  LocalStorageService,
  SecurityService,
  FileSystemService,
  UtilityService,
  GitService,
  GithubApiService
];

const declareComps = [
  ClickOutSideDirective,
  OverCountedDirective,
  SimpleEllipsisDirective,
  ReactiveEllipsisDirective,
  SmallLoadComponent,
  SectionLoadComponent
];

@NgModule({
  declarations: [
    ...declareComps,
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
    ...declareComps
  ]
})
export class CoreModule {
}
