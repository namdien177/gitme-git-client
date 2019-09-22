import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HttpClient, HttpClientModule } from '@angular/common/http';

import { AppRouting } from './app.routing';
// NG Translate
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ElectronService } from './services/system/electron.service';

import { WebviewDirective } from './shared/directives/webview.directive';

import { AppComponent } from './app.component';
import { WindowsFrameComponent } from './shared/layout/windows-frame/windows-frame.component';
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools';
import { AppConfig } from '../environments/environment';
import { LocalStorageService } from './services/system/localStorage.service';
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store';
import { CoreModule } from './shared/modules/core.module';
import { HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';

import xml from 'highlight.js/lib/languages/xml';
import scss from 'highlight.js/lib/languages/scss';
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export function hljsLanguages() {
    return [
        { name: 'typescript', func: typescript },
        { name: 'javascript', func: javascript },
        { name: 'scss', func: scss },
        { name: 'xml', func: xml }
    ];
}

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
                deps: [HttpClient]
            }
        }),
        AppConfig.production ? [] : AkitaNgDevtools.forRoot(),
        AkitaNgRouterStoreModule.forRoot(),
        BrowserAnimationsModule,
    ],
    providers: [
        ElectronService,
        LocalStorageService,
        {
            provide: HIGHLIGHT_OPTIONS,
            useValue: {
                languages: hljsLanguages,
            }
        }],
    bootstrap: [AppComponent]
})
export class AppModule {
}
