import { Injectable } from '@angular/core';

import { Store } from '../shuttle-store';
import { AppService, AppState } from '../services.ref';
import { FormData } from './page7.component';

////////////////////////////////////////////////////////////////////////////
// Service
@Injectable()
export class Page7Service extends AppService {
  constructor(store: Store) { super(store); }

  putForm(data: FormData) { return this.mainStore.put(data, S._FORMDATA_, { rollback: true }); }
}

const S = Page7Service; // shorthand

////////////////////////////////////////////////////////////////////////////
// State (Declared only getters from Store)
@Injectable()
export class Page7State extends AppState {
  constructor(store: Store) { super(store); }

  get title() { return this.mainStore.takeLatest<string>(S._TITLE_); }

  get form() { return this.mainStore.takeLatest<FormData>(S._FORMDATA_); }
  get form$() { return this.mainStore.takeLatest$<FormData>(S._FORMDATA_); }
  get formReplayStream$$() { return this.mainStore.takePresetReplayStream$<FormData>(S._FORMDATA_, { interval: 20, limit: 100 }); }
}