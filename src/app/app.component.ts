import { Component } from '@angular/core';
import { ElectronService } from './services/system/electron.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';
import { FileSystemService } from './services/system/fileSystem.service';

@Component({
    selector: 'gitme-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    constructor(
        public electronService: ElectronService,
        private fileServices: FileSystemService,
        private translate: TranslateService
    ) {

        translate.setDefaultLang('en');
        console.log('AppConfig', AppConfig);

        // if (ElectronService.isElectron()) {
        //   console.log('Mode electron');
        // } else {
        //   console.log('Mode web');
        // }
    }
}
