import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { Terminal } from 'xterm';

export interface XTerminalState {
  is_open: boolean;
  current_dir?: string;
  terminal?: Terminal;
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

