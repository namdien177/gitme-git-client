import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../modules/core.module';
import { CommitFilesComponent } from './commit-files/commit-files.component';
import { CommitMenuComponent } from './commit-menu/commit-menu.component';

const declareComps = [
    CommitFilesComponent,
];

@NgModule({
    declarations: [
        ...declareComps,
        CommitMenuComponent
    ],
    exports: [
        ...declareComps
    ],
    imports: [
        CommonModule,
        CoreModule
    ]
})
export class ShareCommitComponentsModule {

}
