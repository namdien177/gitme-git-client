import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../shared/modules/core.module';
import { ApplicationRouting } from './application.routing';
import { WelcomeScreenComponent } from './welcome-screen/welcome-screen.component';
import { ImportLocalComponent } from './import-local/import-local.component';
import { CreateLocalComponent } from './create-local/create-local.component';
import { ImportHttpsComponent } from './import-https/import-https.component';
import { ApplicationComponent } from './application.component';
import { ShareCredentialsComponentsModule } from '../../shared/components/credential/ShareCredentialsComponents.module';

const declareComps = [
  WelcomeScreenComponent, ImportLocalComponent, CreateLocalComponent, ImportHttpsComponent,
  ApplicationComponent
];

@NgModule({
  declarations: [...declareComps],
  imports: [
    CommonModule,
    CoreModule,
    ShareCredentialsComponentsModule,
    ApplicationRouting
  ]
})
export class ApplicationModule {
}
