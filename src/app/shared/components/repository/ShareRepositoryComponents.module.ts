import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../modules/core.module';
import { NavigationRepositoriesComponent } from './navigation-repositories/navigation-repositories.component';
import { RepositoryItemComponent } from './repository-item/repository-item.component';
import { ShareCredentialsComponentsModule } from '../credential/ShareCredentialsComponents.module';
import { RepoChangesComponent } from './repo-changes/repo-changes.component';

const declareComps = [
  NavigationRepositoriesComponent,
  RepositoryItemComponent,
  RepoChangesComponent,
];

@NgModule({
  declarations: [
    ...declareComps,
  ],
  exports: [
    ...declareComps,
  ],
  imports: [
    CommonModule,
    ShareCredentialsComponentsModule,
    CoreModule,
  ],
})
export class ShareRepositoryComponentsModule {

}
