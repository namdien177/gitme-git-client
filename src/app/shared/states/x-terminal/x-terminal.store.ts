import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { Terminal } from 'xterm';
import * as pty from 'node-pty';

export interface XTerminalState {
  is_open: boolean;
  current_dir?: string;
  terminal?: Terminal;
  pty?: pty.IPty;
}

export function createInitialState(): XTerminalState {
  return {
    is_open: false
  };
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'x-terminal' })
export class XTerminalStore extends Store<XTerminalState> {

  constructor() {
    super(createInitialState());
  }

}

