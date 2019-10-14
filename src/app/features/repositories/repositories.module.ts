import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RepositoriesRouting } from './repositories.routing';
import { RepositoriesComponent } from './repositories.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CoreModule } from '../../shared/modules/core.module';
import { XTerminalModule } from '../../shared/layout/x-terminal/x-terminal.module';
import { RepoChangesComponent } from './dashboard/repo-changes/repo-changes.component';
import { RepoHistoryComponent } from './repo-history/repo-history.component';
import { RepoSettingsComponent } from './repo-settings/repo-settings.component';
import { HighlightModule } from 'ngx-highlightjs';
import { ShareRepositoryComponentsModule } from '../../shared/components/repository/ShareRepositoryComponents.module';
import { ShareBranchComponentsModule } from '../../shared/components/branch/ShareBranchComponents.module';
import { ShareCommitComponentsModule } from '../../shared/components/commit/ShareCommitComponents.module';


const declareComps = [
    RepositoriesComponent,
    DashboardComponent,
];

@NgModule({
    declarations: [
        ...declareComps,
        RepoChangesComponent,
        RepoHistoryComponent,
        RepoSettingsComponent,
    ],
    exports: [],
    imports: [
        CommonModule,
        XTerminalModule,
        CoreModule,
        RepositoriesRouting,
        ShareRepositoryComponentsModule,
        ShareBranchComponentsModule,
        ShareCommitComponentsModule,
        HighlightModule,
    ]
})
export class RepositoriesModule {
}
