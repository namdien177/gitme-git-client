import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationRepositoriesComponent } from './navigation-repositories.component';
import { RepositoryItemComponent } from '../../../components/repository-item/repository-item.component';
import { CoreModule } from '../../../modules/core.module';
import { RepositoryAddComponent } from '../../../components/repository-add-clone/repository-add.component';
import { RepositoryAddLocalComponent } from '../../../components/repository-add-local/repository-add-local.component';

const declareComps = [
  NavigationRepositoriesComponent,
  RepositoryItemComponent,
  RepositoryAddLocalComponent,
  RepositoryAddComponent
];

@NgModule({
  declarations: [
    ...declareComps
  ],
  imports: [
    CommonModule,
    CoreModule,
  ],
  providers: [],
  exports: [
    ...declareComps
  ]
})
export class NavigationRepositoryModule {
}
