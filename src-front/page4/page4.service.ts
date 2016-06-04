import { Injectable } from '@angular/core';

import { StoreController } from '../shuttle-store';
import { Identifiers } from '../services.ref';
import { KeyInput } from './page4.component';


////////////////////////////////////////////////////////////////////////////
// Service
@Injectable()
export class Page4Service {
  constructor(public SC: StoreController, private IR: Identifiers) { }
  private mainStore = this.SC.getStoreSafely(); // MainStoreを取得

  putKeyInput(data: KeyInput) { return this.mainStore.put(data, this.IR._KEYINPUT_, { limit: 100, filterId: data.filterId }); }
}


////////////////////////////////////////////////////////////////////////////
// State (Declared only getters from Store)
@Injectable()
export class Page4State {
  constructor(private SC: StoreController, private IR: Identifiers) { }
  private mainStore = this.SC.getStoreSafely(); // MainStoreを取得

  get title() { return this.mainStore.takeLatest<string>(this.IR._TITLE_); }

  get keyInputs$() { return this.mainStore.takeMany$<KeyInput>(this.IR._KEYINPUT_); }
  get keyInputsReplayStream$$() { return this.mainStore.takePresetReplayArrayStream$<KeyInput>(this.IR._KEYINPUT_, { truetime: true }); }
}