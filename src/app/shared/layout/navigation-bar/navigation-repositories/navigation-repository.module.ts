import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationRepositoriesComponent } from './navigation-repositories.component';
import { RepositoryItemComponent } from '../../../components/repository-item/repository-item.component';
import { CoreModule } from '../../../modules/core.module';
import { RepositoryCloneComponent } from '../../../components/repository-add-clone/repository-clone.component';
import { RepositoryAddLocalComponent } from '../../../components/repository-add-local/repository-add-local.component';

const declareComps = [
  NavigationRepositoriesComponent,
  RepositoryItemComponent,
  RepositoryAddLocalComponent,
  RepositoryCloneComponent
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
