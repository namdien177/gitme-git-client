import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from './core.module';
import { YesNoDecisionComponent } from '../components/UI/dialogs/yes-no-decision/yes-no-decision.component';
import { OnlyInfoComponent } from '../components/UI/dialogs/only-info/only-info.component';
import { CommitOptionsComponent } from '../components/commit/_dialogs/commit-options/commit-options.component';
import { MaterialModule } from './material.module';


const dialogComps = [
    // General comp
    YesNoDecisionComponent,
    OnlyInfoComponent,
    CommitOptionsComponent
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
