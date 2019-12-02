import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';

import { HttpClient, HttpClientModule } from '@angular/common/http';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRouting } from './app.routing';
// NG Translate
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store';
import { AppConfig } from 'environments/environment';

import { ElectronService } from './services/system/electron.service';
import { AppComponent } from './app.component';
import { WindowsFrameComponent } from './shared/layout/windows-frame/windows-frame.component';
import { LocalStorageService } from './services/system/localStorage.service';
import { CoreModule } from './shared/modules/core.module';
import { DialogsModule } from './shared/modules/dialogs.module';
import { ImportLocalComponent } from './features/application/import-local/import-local.component';
import { CreateLocalComponent } from './features/application/create-local/create-local.component';
import { ImportHttpsComponent } from './features/application/import-https/import-https.component';
import { ShareCredentialsComponentsModule } from './shared/components/credential/ShareCredentialsComponents.module';
import { StarterScreenComponent } from './shared/layout/starter-screen/starter-screen.component';


// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function configFactory(config: ElectronService) {
  return () => config.initializeConfigFromLocalDatabase();
}

const declareComps = [
  AppComponent,
  WindowsFrameComponent,
  ImportLocalComponent,
  CreateLocalComponent,
  ImportHttpsComponent,
];

@NgModule({
  declarations: [
    ...declareComps,
    StarterScreenComponent,
  ],
  imports: [
    BrowserModule,
    CoreModule,
    HttpClientModule,
    AppRouting,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient],
      },
    }),
    AppConfig.production ? [] : AkitaNgDevtools.forRoot(),
    AkitaNgRouterStoreModule.forRoot(),
    BrowserAnimationsModule,
    ShareCredentialsComponentsModule,
    // Dialogs
    DialogsModule,
  ],
  providers: [
    ElectronService,
    LocalStorageService,
    {
      provide: APP_INITIALIZER,
      useFactory: configFactory,
      deps: [ElectronService],
      multi: true
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
}
