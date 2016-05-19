import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { ShuttleStore, ShuttleStoreService, StateRule } from '../store';
import { Page1Service as P1S } from '../services.ref';

////////////////////////////////////////////////////////////////////////////
// Service
@Injectable()
export class Page2Service extends ShuttleStoreService {
  constructor(store: ShuttleStore) { super(store); }
}

// const P2S = Page2Service; // shorthand

////////////////////////////////////////////////////////////////////////////
// State (Declared only getters from Store)
@Injectable()
export class Page2State {
  constructor(private store: ShuttleStore) { }

  get title() { return this.store.getState<string>(P1S.APPTITLE_IDENTIFIER); }
  get titles$() { return this.store.getStates$<string>(P1S.APPTITLE_IDENTIFIER); }
  get titleReplayStream$$() { return this.store.getPresetReplayStream$<string>(P1S.APPTITLE_IDENTIFIER, null, 75); }

  get colorsReplayStream$$() { return this.store.getPresetReplayArrayStream$<string>(P1S.COLOR_IDENTIFIER, null, 300); }
}