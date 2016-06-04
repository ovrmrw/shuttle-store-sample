import { Injectable } from '@angular/core';

import { StoreController } from '../shuttle-store';
import { Identifiers } from '../services.ref';


////////////////////////////////////////////////////////////////////////////
// Service
@Injectable()
export class Page1Service {
  constructor(public SC: StoreController, private IR: Identifiers) { }
  private mainStore = this.SC.getStoreSafely(); // MainStoreを取得

  putTitle(data: string) { return this.mainStore.put(data, this.IR._TITLE_, { rollback: true }); }
  putTitleWithLock(data: string) { return this.mainStore.put(data, this.IR._TITLE_, { rollback: true, lock: true }); }
  unlockTitle() { return this.mainStore.unlockState(this.IR._TITLE_); }

  putColor(data: string) { return this.mainStore.put(data, this.IR._COLOR_, { limit: 50, rollback: true, duration: 1000 * 30 }); }
}


////////////////////////////////////////////////////////////////////////////
// State (Declared only getters from Store)
@Injectable()
export class Page1State {
  constructor(private SC: StoreController, private IR: Identifiers) { }
  private mainStore = this.SC.getStoreSafely(); // MainStoreを取得

  get title() { return this.mainStore.takeLatest<string>(this.IR._TITLE_); }
  get titles$() { return this.mainStore.takeMany$<string>(this.IR._TITLE_); }
  get titleReplayStream$$() { return this.mainStore.takePresetReplayStream$<string>(this.IR._TITLE_, { interval: 25 }); }

  get colorsReplayStream$$() { return this.mainStore.takePresetReplayArrayStream$<string>(this.IR._COLOR_, { interval: 100 }); }
}