import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../modules/core.module';
import { NavigationBarComponent } from './navigation-bar.component';
import { NavigationRepositoryModule } from './navigation-repositories/navigation-repository.module';
import { NavigationBranchModule } from './navigation-branches/navigation-branch.module';
import { NavigationCommitInfoComponent } from './navigation-commit-info/navigation-commit-info.component';

const declareComps = [
  NavigationBarComponent,
  NavigationCommitInfoComponent,
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
    NavigationRepositoryModule,
    NavigationBranchModule
  ],
})
export class NavigationBarModule {
}
