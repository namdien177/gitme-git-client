import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationRepositoriesComponent } from './navigation-repositories.component';
import { RepositoryItemComponent } from '../../../components/repository-item/repository-item.component';
import { CoreModule } from '../../../modules/core.module';
import { RepositoryAddComponent } from './repository-add/repository-add.component';
import { ReactiveFormsModule } from '@angular/forms';

const declareComps = [
  NavigationRepositoriesComponent,
  RepositoryItemComponent,
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
