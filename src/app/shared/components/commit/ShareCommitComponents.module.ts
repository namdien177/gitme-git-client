import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../modules/core.module';
import { CommitFilesComponent } from './commit-files/commit-files.component';
import { CommitMenuComponent } from '../../layout/commit-menu/commit-menu.component';
import { LogsListComponent } from '../logs/logs-list/logs-list.component';

const declareComps = [
  CommitFilesComponent,
  CommitMenuComponent,
  LogsListComponent
];

@NgModule({
  declarations: [
    ...declareComps,
  ],
  exports: [
    ...declareComps,
  ],
  imports: [
    CommonModule,
    CoreModule
  ]
})
export class ShareCommitComponentsModule {

}
