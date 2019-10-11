import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalStorageService } from '../../services/system/localStorage.service';
import { ClickOutSideDirective, OverCountedDirective, ReactiveEllipsisDirective, SimpleEllipsisDirective } from '../directives';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SecurityService } from '../../services/system/security.service';
import { FileSystemService } from '../../services/system/fileSystem.service';
import { UtilityService } from '../utilities/utility.service';
import { GitService } from '../../services/features/git.service';
import { CredentialInputComponent } from '../components/credential/credential-input/credential-input.component';
import { CredentialListComponent } from '../components/credential/credential-list/credential-list.component';
import { SmallLoadComponent } from '../components/UI/small-load/small-load.component';
import { MaterialModule } from './material.module';
import { SectionLoadComponent } from '../components/UI/section-load/section-load.component';
import { SharedPipeModule } from '../pipe/shared-pipe.module';

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
    GitService
];

const declareComps = [
    ClickOutSideDirective,
    OverCountedDirective,
    SimpleEllipsisDirective,
    ReactiveEllipsisDirective,
    CredentialInputComponent,
    CredentialListComponent,
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
