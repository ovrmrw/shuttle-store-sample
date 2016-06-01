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

  get title() { return this.mainStore.takeLatest<string>(S._TITLE_); }
  get titles$() { return this.mainStore.takeMany$<string>(S._TITLE_); }
  get titleReplayStream$$() { return this.mainStore.takePresetReplayStream$<string>(S._TITLE_, { truetime: true }); }
  get titleReplayStreamDesc$$() { return this.mainStore.takePresetReplayStream$<string>(S._TITLE_, { truetime: true, descending: true }); }

  get colorsReplayStream$$() { return this.mainStore.takePresetReplayArrayStream$<string>(S._COLOR_, { truetime: true }); }
  get colorsReplayStreamDesc$$() { return this.mainStore.takePresetReplayArrayStream$<string>(S._COLOR_, { truetime: true, descending: true }); }
}