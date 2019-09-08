import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
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
    GitService
];

const declareComps = [
    ClickOutSideDirective,
    OverCountedDirective,
    SimpleEllipsisDirective,
    ReactiveEllipsisDirective,
    CredentialInputComponent,
    CredentialListComponent,
    SmallLoadComponent
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
        ...declareComps
    ]
})
export class CoreModule {
}
