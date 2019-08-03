import { HostListener, Injectable } from '@angular/core';
import { XTerminalStore } from './x-terminal.store';
import { XTerminalQuery } from './x-terminal.query';
import { IDisposable as xtermIDisposable, Terminal } from 'xterm';
import * as os from 'os';
import * as fit from 'xterm/lib/addons/fit/fit';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class XTerminalService {

  private isResizing: Subject<any> = new Subject<any>();

  private pty;

  private ptyDataListener = null;
  private xtermDataListener: xtermIDisposable = null;
  private xtermResizeListener: xtermIDisposable = null;

  constructor(
    private xTerminalStore: XTerminalStore,
    private xTerminalQuery: XTerminalQuery,
  ) {
    this.pty = window.require('node-pty');

    this.isResizing.pipe(
      debounceTime(20),
    ).subscribe(event => {
      if (!!event) {
        this.fitTerminal();
      }
    });

    this.xTerminalQuery.select().subscribe(
      terminalState => {
        if (!!terminalState.terminal && !!terminalState.pty) {
          this.startListenerTerminal(terminalState.terminal, terminalState.pty);
        } else {
          this.stopListenerTerminal();
        }
      }
    );
  }

  openTerminal(terminalDOM: HTMLElement) {
    const terminal = new Terminal({
      fontSize: 12,
      experimentalCharAtlas: 'dynamic'
    });
    terminal.open(terminalDOM);

    const ptyProc = this.pty.spawn(os.platform() === 'win32' ? 'powershell.exe' : process.env.SHELL || '/bin/bash', [], {
      cols: terminal.cols,
      rows: terminal.rows,
      cwd: process.cwd(),
      env: process.env
    });

    this.xTerminalStore.update({
      terminal: terminal,
      pty: ptyProc
    });
  }

  closeTerminal(terminalDOM: HTMLElement) {
    if (!!this.xTerminalQuery.getValue().terminal) {
      this.xTerminalStore.update({
        terminal: null,
        pty: null
      });
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

  @HostListener('window:resize', ['$event'])
  onWindowsResize(event) {
    this.isResizing.next(event);
  }

  private startListenerTerminal(terminalInstance: Terminal, ptyInstance) {
    this.xtermDataListener = terminalInstance.onData((data: string) => {
      ptyInstance.write(data);
    });
    this.xtermResizeListener = terminalInstance.onResize(size => {
      ptyInstance.resize(
        Math.max(size ? size.cols : terminalInstance.cols, 1),
        Math.max(size ? size.rows : terminalInstance.rows, 1)
      );
    });
    this.ptyDataListener = ptyInstance.onData(data => {
      terminalInstance.write(data);
    });
  }


  private stopListenerTerminal() {
    if (!!this.xtermDataListener) {
      this.xtermDataListener.dispose();
    }

    if (!!this.xtermResizeListener) {
      this.xtermResizeListener.dispose();
    }

    if (!!this.ptyDataListener) {
      this.ptyDataListener.dispose();
    }
  }

  private fitTerminal() {
    const terminal = this.xTerminalStore;
    if (terminal instanceof Terminal) {
      fit.fit(terminal);
    }
  }
}
