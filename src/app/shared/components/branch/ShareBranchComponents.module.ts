import { ListBranchesComponent } from './list-branches/list-branches.component';
import { BranchItemComponent } from './branch-item/branch-item.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../modules/core.module';

const declareComps = [
  ListBranchesComponent,
  BranchItemComponent,
];

@NgModule({
  declarations: [
    ...declareComps,
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
