import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../modules/core.module';
import { CredentialInputComponent } from './credential-input/credential-input.component';
import { CredentialListComponent } from './credential-list/credential-list.component';

const declareComps = [
  CredentialInputComponent,
  CredentialListComponent,
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
    CoreModule
  ]
})
export class ShareCredentialsComponentsModule {

}
