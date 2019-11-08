import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../../modules/core.module';

const declareComps = [];

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
