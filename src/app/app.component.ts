import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';
import { FileSystemService } from './services/system/fileSystem.service';
import { GitService } from './services/features/git.service';

@Component({
    selector: 'gitme-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    constructor(
        public gitService: GitService,
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

        // this.gitService.git('D:\\Projects\\School\\_topup\\GitMe\\gitme-git-client').push('origin', 'side-bar-work');
    }
}
