import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XTerminalComponent } from './x-terminal.component';
import { CoreModule } from '../../modules/core.module';
import { XTerminalService } from '../../state/x-terminal';

const providers = [
    XTerminalService,
];

@NgModule({
    declarations: [XTerminalComponent],
    imports: [
        CommonModule,
        CoreModule
    ],
    exports: [
        XTerminalComponent
    ],
    providers: [
        ...providers
    ]
})
export class XTerminalModule {
}
