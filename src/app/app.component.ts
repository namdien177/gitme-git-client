import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
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

        // if (ElectronService.isElectron()) {
        //   console.log('Mode electron');
        // } else {
        //   console.log('Mode web');
        // }

        // this.gitService.gitInstance('D:\\Projects\\School\\_topup\\GitMe\\gitme-gitInstance-client').push('origin', 'side-bar-work');
    }
}
