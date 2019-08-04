import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../modules/core.module';
import { NavigationBarComponent } from './navigation-bar.component';
import { SideBarModule } from '../side-bar/side-bar.module';

const declareComps = [
  NavigationBarComponent,
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
    CoreModule,
    SideBarModule
  ],
})
export class NavigationBarModule {
}
