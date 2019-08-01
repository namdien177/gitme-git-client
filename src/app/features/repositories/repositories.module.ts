import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RepositoriesRoutingModule } from './repositories-routing.module';
import { RepositoriesComponent } from './repositories.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SideBarModule } from '../../shared/layout/side-bar/side-bar.module';
import { CoreModule } from '../../shared/modules/core.module';
import { XTerminalModule } from '../../shared/layout/x-terminal/x-terminal.module';

const declareComps = [
  RepositoriesComponent,
  DashboardComponent,
];

@NgModule({
  declarations: [
    ...declareComps
  ],
  imports: [
    CommonModule,
    SideBarModule,
    XTerminalModule,
    CoreModule,
    RepositoriesRoutingModule
  ]
})
export class RepositoriesModule {
}
