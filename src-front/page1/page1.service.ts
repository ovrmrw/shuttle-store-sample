import { Injectable } from '@angular/core';

import { Store, StoreService } from '../shuttle-store';

////////////////////////////////////////////////////////////////////////////
// Service
@Injectable()
export class Page1Service extends StoreService {
  static _TITLE_ = ['app-title', Page1Service];
  static _COLOR_ = ['color', Page1Service];

  constructor(store: Store) { super(store); }

  setTitle(data: string) { return this.store.setState(data, S._TITLE_, { rollback: true }); }
  setColor(data: string) { return this.store.setState(data, S._COLOR_, { limit: 20, rollback: true }); }
}

const S = Page1Service; // shorthand

////////////////////////////////////////////////////////////////////////////
// State (Declared only getters from Store)
@Injectable()
export class Page1State {
  constructor(private store: Store) { }

  get title() { return this.store.getState<string>(S._TITLE_); }
  get titles$() { return this.store.getStates$<string>(S._TITLE_); }
  get titleReplayStream$$() { return this.store.getPresetReplayStream$<string>(S._TITLE_, { interval: 25 }); }

  get colorsReplayStream$$() { return this.store.getPresetReplayArrayStream$<string>(S._COLOR_, { interval: 100, descending: true }); }
}