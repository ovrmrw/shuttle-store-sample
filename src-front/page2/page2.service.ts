import { Injectable } from '@angular/core';

import { Store, StoreService } from '../shuttle-store';
import { Page1Service as P1S } from '../services.ref';

////////////////////////////////////////////////////////////////////////////
// Service
@Injectable()
export class Page2Service extends StoreService {
  constructor(store: Store) { super(store); }
}

// const P2S = Page2Service; // shorthand

////////////////////////////////////////////////////////////////////////////
// State (Declared only getters from Store)
@Injectable()
export class Page2State {
  constructor(private store: Store) { }

  get title() { return this.store.getState<string>(P1S._TITLE_); }
  get titles$() { return this.store.getStates$<string>(P1S._TITLE_); }
  get titleReplayStream$$() { return this.store.getPresetReplayStream$<string>(P1S._TITLE_, { interval: 100 }); }

  get colorsReplayStream$$() { return this.store.getPresetReplayArrayStream$<string>(P1S._COLOR_, { interval: 400 }); }
}