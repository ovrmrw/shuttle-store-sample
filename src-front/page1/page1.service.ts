import { Injectable } from '@angular/core';

import { ShuttleStore, ShuttleStoreService, StateRule } from '../store';

////////////////////////////////////////////////////////////////////////////
// Service
@Injectable()
export class Page1Service extends ShuttleStoreService {
  static TITLE_IDENTIFIER = ['app-title', Page1Service];
  static COLOR_IDENTIFIER = ['color', Page1Service];

  constructor(store: ShuttleStore) { super(store); }

  setTitle(title: string) { this.store.setState(title, P1S.TITLE_IDENTIFIER); }
  setColor(color: string) { this.store.setState(color, P1S.COLOR_IDENTIFIER, new StateRule({ limit: 20 })); }
}

const P1S = Page1Service; // shorthand

////////////////////////////////////////////////////////////////////////////
// State (Declared only getters from Store)
@Injectable()
export class Page1State {
  constructor(private store: ShuttleStore) { }

  get title() { return this.store.getState<string>(P1S.TITLE_IDENTIFIER); }
  get titles$() { return this.store.getStates$<string>(P1S.TITLE_IDENTIFIER); }
  get titleReplayStream$$() { return this.store.getPresetReplayStream$<string>(P1S.TITLE_IDENTIFIER, null, 25); }

  get colorsReplayStream$$() { return this.store.getPresetReplayArrayStream$<string>(P1S.COLOR_IDENTIFIER, null, 100, true); }
}