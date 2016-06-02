import { Injectable } from '@angular/core';

import { Store } from '../shuttle-store';
import { AppService, AppState, STORE_FORM } from '../services.ref';
import { FormData } from './page5.component';


////////////////////////////////////////////////////////////////////////////
// Service
@Injectable()
export class Page5Service extends AppService {
  constructor(store: Store) { super(store); }
  formStore: Store = this.getStoreSafely(STORE_FORM); // フォームのStateを管理するためのStore

  putForm(data: FormData) { return this.formStore.put(data, S._FORMDATA_, { rollback: true }); }
}

const S = Page5Service; // shorthand


////////////////////////////////////////////////////////////////////////////
// State (Declared only getters from Store)
@Injectable()
export class Page5State extends AppState {
  constructor(store: Store) { super(store); }
  formStore: Store = this.getStoreSafely(STORE_FORM); // フォームのStateを管理するためのStore

  get title() { return this.mainStore.takeLatest<string>(S._TITLE_); }

  get form() { return this.formStore.takeLatest<FormData>(S._FORMDATA_); }
  get form$() { return this.formStore.takeLatest$<FormData>(S._FORMDATA_); }
  get formReplayStream$$() { return this.formStore.takePresetReplayStream$<FormData>(S._FORMDATA_, { interval: 20, limit: 100 }); }
}