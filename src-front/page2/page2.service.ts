import { Injectable } from '@angular/core';

import { Store } from '../shuttle-store';
import { AppService, AppState } from '../services.ref';

////////////////////////////////////////////////////////////////////////////
// Service
@Injectable()
export class Page2Service extends AppService {
  constructor(store: Store) { super(store); }
}

const S = Page2Service; // shorthand

////////////////////////////////////////////////////////////////////////////
// State (Declared only getters from Store)
@Injectable()
export class Page2State extends AppState {
  constructor(store: Store) { super(store); }

  get title() { return this.store.takeLatest<string>(S._TITLE_); }
  get titles$() { return this.store.takeMany$<string>(S._TITLE_); }
  get titleReplayStream$$() { return this.store.takePresetReplayStream$<string>(S._TITLE_, { truetime: true }); }
  get titleReplayStreamDesc$$() { return this.store.takePresetReplayStream$<string>(S._TITLE_, { truetime: true, descending: true }); }

  get colorsReplayStream$$() { return this.store.takePresetReplayArrayStream$<string>(S._COLOR_, { truetime: true }); }
  get colorsReplayStreamDesc$$() { return this.store.takePresetReplayArrayStream$<string>(S._COLOR_, { truetime: true, descending: true }); }
}