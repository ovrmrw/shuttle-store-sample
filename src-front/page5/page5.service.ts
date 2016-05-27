import { Injectable } from '@angular/core';

import { Store } from '../shuttle-store';
import { AppService } from '../services.ref';
import { FormData } from './page5.component';

////////////////////////////////////////////////////////////////////////////
// Service
@Injectable()
export class Page5Service extends AppService {
  constructor(store: Store) { super(store); }

  setForm(data: FormData) { return this.store.setState(data, S._FORMDATA_, { rollback: true }); }
}

const S = Page5Service; // shorthand

////////////////////////////////////////////////////////////////////////////
// State (Declared only getters from Store)
@Injectable()
export class Page5State {
  constructor(private store: Store) { }

  get title() { return this.store.getState<string>(S._TITLE_); }

  get form() { return this.store.getState<FormData>(S._FORMDATA_); }
  get form$() { return this.store.getState$<FormData>(S._FORMDATA_); }
  get formReplayStream$$() { return this.store.getPresetReplayStream$<FormData>(S._FORMDATA_, { interval: 20, limit: 100 }); }
}