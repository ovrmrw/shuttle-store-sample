import { Injectable } from '@angular/core';

import { Store } from '../shuttle-store';
import { AppService, AppState } from '../services.ref';
import { KeyInput } from './page4.component';


////////////////////////////////////////////////////////////////////////////
// Service
@Injectable()
export class Page4Service extends AppService {
  constructor(store: Store) { super(store); }

  putKeyInput(data: KeyInput) { return this.mainStore.put(data, S._KEYINPUT_, { limit: 100, filterId: data.filterId }); }
}

const S = Page4Service; // shorthand


////////////////////////////////////////////////////////////////////////////
// State (Declared only getters from Store)
@Injectable()
export class Page4State extends AppState {
  constructor(store: Store) { super(store); }

  get title() { return this.mainStore.takeLatest<string>(S._TITLE_); }

  get keyInputs$() { return this.mainStore.takeMany$<KeyInput>(S._KEYINPUT_); }
  get keyInputsReplayStream$$() { return this.mainStore.takePresetReplayArrayStream$<KeyInput>(S._KEYINPUT_, { truetime: true }); }
}