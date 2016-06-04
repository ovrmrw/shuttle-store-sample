import { Injectable } from '@angular/core';

import { StoreController } from '../shuttle-store';
import { Identifiers } from '../services.ref';


////////////////////////////////////////////////////////////////////////////
// Service
@Injectable()
export class Page2Service {
  constructor(public SC: StoreController, private IR: Identifiers) { }
  // private mainStore = this.SC.getStoreSafely(); // MainStoreを取得
}


////////////////////////////////////////////////////////////////////////////
// State (Declared only getters from Store)
@Injectable()
export class Page2State {
  constructor(private SC: StoreController, private IR: Identifiers) { }
  private mainStore = this.SC.getStoreSafely(); // MainStoreを取得

  get title() { return this.mainStore.takeLatest<string>(this.IR._TITLE_); }
  get titles$() { return this.mainStore.takeMany$<string>(this.IR._TITLE_); }
  get titleReplayStream$$() { return this.mainStore.takePresetReplayStream$<string>(this.IR._TITLE_, { truetime: true }); }
  get titleReplayStreamDesc$$() { return this.mainStore.takePresetReplayStream$<string>(this.IR._TITLE_, { truetime: true, descending: true }); }

  get colorsReplayStream$$() { return this.mainStore.takePresetReplayArrayStream$<string>(this.IR._COLOR_, { truetime: true }); }
  get colorsReplayStreamDesc$$() { return this.mainStore.takePresetReplayArrayStream$<string>(this.IR._COLOR_, { truetime: true, descending: true }); }
}