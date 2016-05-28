import { Injectable } from '@angular/core';

import { Store } from '../shuttle-store';
import { AppService } from '../services.ref';
import { KeyInput } from './page4.component';

////////////////////////////////////////////////////////////////////////////
// Service
@Injectable()
export class Page4Service extends AppService {
  constructor(store: Store) { super(store); }

  putKeyInput(data: KeyInput) { return this.store.put(data, S._KEYINPUT_, { limit: 100, filterId: data.filterId }); }
  // putUniqueId(data: string) { return this.store.put(data, S._UNIQUEID_); }
}

const S = Page4Service; // shorthand

////////////////////////////////////////////////////////////////////////////
// State (Declared only getters from Store)
@Injectable()
export class Page4State {
  constructor(private store: Store) { }

  get title() { return this.store.takeLatest<string>(S._TITLE_); }

  get keyInputs$() { return this.store.takeMany$<KeyInput>(S._KEYINPUT_); }
  get keyInputsReplayStream$$() { return this.store.takePresetReplayArrayStream$<KeyInput>(S._KEYINPUT_, { truetime: true }); }

  // get uniqueId() { return this.store.takeLatest<string>(S._UNIQUEID_); }
}