import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationBranchesComponent } from './navigation-branches.component';
import { CoreModule } from '../../../modules/core.module';
import { BranchItemComponent } from '../../../components/branch/branch-item/branch-item.component';
import { BranchAddComponent } from '../../../components/branch/branch-add/branch-add.component';

const declareComps = [
    NavigationBranchesComponent,
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
export class NavigationBranchModule {
}
