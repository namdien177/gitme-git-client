import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from './core.module';
import { YesNoDecisionComponent } from '../components/UI/dialogs/yes-no-decision/yes-no-decision.component';
import { OnlyInfoComponent } from '../components/UI/dialogs/only-info/only-info.component';
import { CommitOptionsComponent } from '../components/commit/_dialogs/commit-options/commit-options.component';
import { MaterialModule } from './material.module';
import { BranchOptionsComponent } from '../components/branch/_dialogs/branch-options/branch-options.component';
import { BranchNewOptionComponent } from '../components/branch/_dialogs/branch-new/branch-new-option/branch-new-option.component';
import { SingleComponent as CommitOptionsSingleComponent } from '../components/commit/_dialogs/context-option/single/single.component';
import { BranchCheckoutStashComponent } from '../components/branch/_dialogs/branch-new/branch-checkout-stash/branch-checkout-stash.component';
import { BranchRenameComponent } from '../components/branch/_dialogs/branch-rename/branch-rename.component';
import { BranchMergeComponent } from '../components/branch/_dialogs/branch-merge/branch-merge.component';
import { ConflictViewerComponent } from '../components/UI/dialogs/conflict-viewer/conflict-viewer.component';
import { ContextMenuComponent } from '../components/repository/_dialogs/context-menu/context-menu.component';
import { BranchStashComponent } from '../components/branch/_dialogs/branch-stash/branch-stash.component';
import { RevertOptionsComponent } from '../components/logs/_dialogs/revert-options/revert-options.component';


const dialogComps = [
  // General comp
  YesNoDecisionComponent,
  OnlyInfoComponent,
  CommitOptionsComponent,
  CommitOptionsSingleComponent,
  BranchOptionsComponent,
  BranchNewOptionComponent,
  BranchCheckoutStashComponent,
  BranchRenameComponent,
  BranchMergeComponent,
  ConflictViewerComponent,
  ContextMenuComponent,
  BranchStashComponent,
  RevertOptionsComponent
];

@NgModule({
  declarations: [
    ...dialogComps,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    CoreModule,
  ],
  entryComponents: [
    ...dialogComps,
  ],
})
export class DialogsModule {
}
