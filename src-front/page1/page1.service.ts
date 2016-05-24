import { Injectable } from '@angular/core';

import { Store, StoreService, StateRule } from '../shuttle-store';

////////////////////////////////////////////////////////////////////////////
// Service
@Injectable()
export class Page1Service extends StoreService {
  static _TITLE_ = ['app-title', Page1Service];
  static _COLOR_ = ['color', Page1Service];

  constructor(store: Store) { super(store); }

  setTitle(text: string) { this.store.setState(text, S._TITLE_); }
  setColor(text: string) { this.store.setState(text, S._COLOR_, new StateRule({ limit: 20 })); }
}

const S = Page1Service; // shorthand

////////////////////////////////////////////////////////////////////////////
// State (Declared only getters from Store)
@Injectable()
export class Page1State {
  constructor(private store: Store) { }

  get title() { return this.store.getState<string>(S._TITLE_); }
  get titles$() { return this.store.getStates$<string>(S._TITLE_); }
  get titleReplayStream$$() { return this.store.getPresetReplayStream$<string>(S._TITLE_, null, 25); }

  get colorsReplayStream$$() { return this.store.getPresetReplayArrayStream$<string>(S._COLOR_, null, 100, true); }
}