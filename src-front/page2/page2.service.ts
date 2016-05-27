import { Injectable } from '@angular/core';

import { Store } from '../shuttle-store';
import { AppService } from '../services.ref';

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
export class Page2State {
  constructor(private store: Store) { }

  get title() { return this.store.getState<string>(S._TITLE_); }
  get titles$() { return this.store.getStates$<string>(S._TITLE_); }
  get titleReplayStream$$() { return this.store.getPresetReplayStream$<string>(S._TITLE_, { interval: 100 }); }

  get colorsReplayStream$$() { return this.store.getPresetReplayArrayStream$<string>(S._COLOR_, { interval: 400 }); }
}