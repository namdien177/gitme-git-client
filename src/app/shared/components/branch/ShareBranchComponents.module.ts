import { ListBranchesComponent } from './list-branches/list-branches.component';
import { BranchItemComponent } from './branch-item/branch-item.component';
import { BranchAddComponent } from './branch-add/branch-add.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../modules/core.module';

const declareComps = [
    ListBranchesComponent,
    BranchItemComponent,
    BranchAddComponent,
];

@NgModule({
    declarations: [
        ...declareComps
    ],
    exports: [
        ...declareComps
    ],
    imports: [
        CommonModule,
        CoreModule
    ]
})
export class ShareBranchComponentsModule {
}
