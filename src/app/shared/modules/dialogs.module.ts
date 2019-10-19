import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from './core.module';
import { YesNoDecisionComponent } from '../components/UI/dialogs/yes-no-decision/yes-no-decision.component';
import { OnlyInfoComponent } from '../components/UI/dialogs/only-info/only-info.component';
import { CommitOptionsComponent } from '../components/commit/_dialogs/commit-options/commit-options.component';
import { MaterialModule } from './material.module';
import { BranchOptionsComponent } from '../components/branch/_dialogs/branch-options/branch-options.component';
import { BranchNewOptionComponent } from '../components/branch/_dialogs/branch-new/branch-new-option/branch-new-option.component';


const dialogComps = [
    // General comp
    YesNoDecisionComponent,
    OnlyInfoComponent,
    CommitOptionsComponent,
    BranchOptionsComponent,
    BranchNewOptionComponent,
];

@NgModule({
    declarations: [
        ...dialogComps
    ],
    imports: [
        CommonModule,
        MaterialModule,
        CoreModule
    ],
    entryComponents: [
        ...dialogComps
    ]
})
export class DialogsModule {
}
