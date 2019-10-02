import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { XTerminalQuery, XTerminalService, XTerminalState } from '../../state/x-terminal';

@Component({
    selector: 'gitme-x-terminal',
    templateUrl: './x-terminal.component.html',
    styleUrls: ['./x-terminal.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class XTerminalComponent implements OnInit {

    isTerminalOpen = false;

    @ViewChild('terminalSection', { static: false }) terminalSection: ElementRef<HTMLDivElement>;
    private terminal: XTerminalState;

    constructor(
        private xTerminal: XTerminalService,
        private xTerminalQuery: XTerminalQuery,
    ) {
    }

    ngOnInit() {
        this.xTerminalQuery.select().subscribe(
            terminal => {
                this.terminal = terminal;
                this.isTerminalOpen = terminal.is_open;
                if (terminal.is_open) {
                    this.xTerminal.openTerminal(this.terminalSection.nativeElement);
                }
            }
        );
    }

    toggleTerminal() {
        this.xTerminal.toggleTerminal(!this.isTerminalOpen);
    }

}
