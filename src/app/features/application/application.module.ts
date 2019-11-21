import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../shared/modules/core.module';
import { ApplicationRouting } from './application.routing';
import { WelcomeScreenComponent } from './welcome-screen/welcome-screen.component';
import { ApplicationComponent } from './application.component';
import { ShareCredentialsComponentsModule } from '../../shared/components/credential/ShareCredentialsComponents.module';

const declareComps = [
  WelcomeScreenComponent,
  ApplicationComponent,
];

@NgModule({
  declarations: [...declareComps],
  imports: [
    CommonModule,
    CoreModule,
    ShareCredentialsComponentsModule,
    ApplicationRouting,
  ],
})
export class ApplicationModule {
}
