import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HttpClient, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
// NG Translate
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ElectronService } from './services/sysem/electron.service';

import { WebviewDirective } from './shared/directives/webview.directive';

import { AppComponent } from './app.component';
import { WindowsFrameComponent } from './shared/layout/windows-frame/windows-frame.component';
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store';
import { AppConfig } from '../environments/environment';
import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { LocalStorageService } from './services/sysem/localStorage.service';
import { NavigationBarComponent } from './shared/layout/bottom-bar/navigation-bar.component';
import { RepoAddComponent } from './features/repo-add/repo-add.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const declareComps = [
  AppComponent,
  WindowsFrameComponent,
  WebviewDirective
];

@NgModule({
  declarations: [
    ...declareComps,
    RepoAddComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    }),
    AppConfig.production ? [] : AkitaNgDevtools.forRoot(),
    AkitaNgRouterStoreModule.forRoot(),
    MDBBootstrapModule.forRoot()
  ],
  providers: [ElectronService, LocalStorageService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
