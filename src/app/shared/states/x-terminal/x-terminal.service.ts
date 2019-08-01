import { Injectable } from '@angular/core';
import { XTerminalStore } from './x-terminal.store';
import { HttpClient } from '@angular/common/http';
import { XTerminalQuery } from './x-terminal.query';
import { Terminal } from 'xterm';
import * as os from 'os';

@Injectable({ providedIn: 'root' })
export class XTerminalService {

  constructor(
    private xTerminalStore: XTerminalStore,
    private xTerminalQuery: XTerminalQuery,
    private http: HttpClient
  ) {
  }

  openTerminal(terminalDOM: HTMLElement) {
    const terminal = new Terminal({
      fontSize: 12,
      experimentalCharAtlas: 'dynamic'
    });
    terminal.open(terminalDOM);

    const ptyProc = pty.spawn(os.platform() === 'win32' ? 'powershell.exe' : process.env.SHELL || '/bin/bash', [], {
      cols: terminal.cols,
      rows: terminal.rows
    });

    const fitDebounced = _debounce(() => {
      (term as any).fit();
    }, 17);

    term.on('data', (data: string) => {
      ptyProc.write(data);
    });

    term.on('resize', size => {
      ptyProc.resize(
        Math.max(size ? size.cols : term.cols, 1),
        Math.max(size ? size.rows : term.rows, 1)
      );
    });

    ptyProc.on('data', data => {
      term.write(data);
    });

    window.onresize = () => {
      fitDebounced();
    };

    this.xTerminalStore.update({
      terminal: terminal
    });
  }

  closeTerminal(terminalDOM: HTMLElement) {
    if (!!this.xTerminalQuery.getValue().terminal) {
      this.xTerminalQuery.getValue().terminal.dispose();
    }
  }

  toggleTerminal(isOpen = true) {
    this.xTerminalStore.update({
      is_open: isOpen
    });
  }

  isOpen() {
    return !!this.xTerminalQuery.getValue().is_open;
  }

  currentDir() {
    const dir = this.xTerminalQuery.getValue().current_dir;
    return !!dir ? dir : '';
  }

  changeDirectory(directory: string = '') {
    this.xTerminalStore.update({
      current_dir: directory
    });
  }
}
