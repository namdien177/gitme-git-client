import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListBranchesComponent } from './list-branches.component';
import { CoreModule } from '../../../modules/core.module';
import { BranchItemComponent } from '../branch-item/branch-item.component';
import { BranchAddComponent } from '../branch-add/branch-add.component';

const declareComps = [
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
export class NavigationBranchModule {
}
