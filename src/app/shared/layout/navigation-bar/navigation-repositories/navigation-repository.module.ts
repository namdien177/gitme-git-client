import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationRepositoriesComponent } from './navigation-repositories.component';
import { RepositoryItemComponent } from '../../../components/repository-item/repository-item.component';
import { CoreModule } from '../../../modules/core.module';

const declareComps = [
  NavigationRepositoriesComponent,
  RepositoryItemComponent,
];

@NgModule({
  declarations: [
    ...declareComps
  ],
  imports: [
    CommonModule,
    CoreModule
  ],
  exports: [
    ...declareComps
  ]
})
export class NavigationRepositoryModule {
}
