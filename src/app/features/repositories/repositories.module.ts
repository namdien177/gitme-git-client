import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RepositoriesRoutingModule } from './repositories-routing.module';
import { RepositoriesComponent } from './repositories.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SideBarComponent } from '../../shared/layout/side-bar/side-bar.component';

const declareComps = [
  SideBarComponent,
  RepositoriesComponent,
  DashboardComponent,
];

@NgModule({
  declarations: [
    ...declareComps
  ],
  imports: [
    CommonModule,
    RepositoriesRoutingModule
  ]
})
export class RepositoriesModule {
}
