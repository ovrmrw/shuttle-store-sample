import { Injectable } from '@angular/core';

import { StoreController } from '../shuttle-store';
import { Identifiers, STORE_FORM } from '../services.ref';
import { FormData } from './page7.type';


////////////////////////////////////////////////////////////////////////////
// Service
@Injectable()
export class Page7Service {
  constructor(public SC: StoreController, private IR: Identifiers) { }
  private mainStore = this.SC.getStoreSafely(); // MainStoreを取得
  private formStore = this.SC.getStoreSafely(STORE_FORM); // フォームのStateを管理するためのStore

  putForm(data: FormData) { return this.formStore.put(data, this.IR._FORMDATA_, { rollback: true }); }
}


////////////////////////////////////////////////////////////////////////////
// State (Declared only getters from Store)
@Injectable()
export class Page7State {
  constructor(private SC: StoreController, private IR: Identifiers) { }
  private mainStore = this.SC.getStoreSafely(); // MainStoreを取得
  private formStore = this.SC.getStoreSafely(STORE_FORM); // フォームのStateを管理するためのStore

  get title() { return this.mainStore.takeLatest<string>(this.IR._TITLE_); }

  get form() { return this.formStore.takeLatest<FormData>(this.IR._FORMDATA_); }
  get form$() { return this.formStore.takeLatest$<FormData>(this.IR._FORMDATA_); }
  get formReplayStream$$() { return this.formStore.takePresetReplayStream$<FormData>(this.IR._FORMDATA_, { interval: 20, limit: 100 }); }
}