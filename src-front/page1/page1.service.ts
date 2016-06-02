import { Injectable, Inject } from '@angular/core';

import { Store } from '../shuttle-store';
import { AppService, AppState } from '../services.ref';


////////////////////////////////////////////////////////////////////////////
// Service
@Injectable()
export class Page1Service extends AppService {
  constructor(store: Store) { super(store); }

  putTitle(data: string) { return this.mainStore.put(data, S._TITLE_, { rollback: true }); }
  putColor(data: string) { return this.mainStore.put(data, S._COLOR_, { limit: 50, rollback: true, duration: 1000 * 30 }); }
}

const S = Page1Service; // shorthand


////////////////////////////////////////////////////////////////////////////
// State (Declared only getters from Store)
@Injectable()
export class Page1State extends AppState {
  constructor(store: Store) { super(store); }

  get title() { return this.mainStore.takeLatest<string>(S._TITLE_); }
  get titles$() { return this.mainStore.takeMany$<string>(S._TITLE_); }
  get titleReplayStream$$() { return this.mainStore.takePresetReplayStream$<string>(S._TITLE_, { interval: 25 }); }

  get colorsReplayStream$$() { return this.mainStore.takePresetReplayArrayStream$<string>(S._COLOR_, { interval: 100 }); }
}