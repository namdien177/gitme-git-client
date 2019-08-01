import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SideBarComponent } from './side-bar.component';
import { RepositoryItemComponent } from '../../components/repository-item/repository-item.component';
import { CoreModule } from '../../modules/core.module';

const declareComps = [
  SideBarComponent,
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
export class SideBarModule {
}
