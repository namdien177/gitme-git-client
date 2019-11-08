import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../modules/core.module';
import { NavigationBarComponent } from './navigation-bar.component';
import { NavigationBranchModule } from '../../components/branch/list-branches/navigation-branch.module';

const declareComps = [
  NavigationBarComponent,
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
    CoreModule,
    NavigationBranchModule
  ],
})
export class NavigationBarModule {
}
