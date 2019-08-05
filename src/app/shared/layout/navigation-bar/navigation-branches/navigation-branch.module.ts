import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationBranchesComponent } from './navigation-branches.component';
import { CoreModule } from '../../../modules/core.module';

const declareComps = [
  NavigationBranchesComponent,
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
