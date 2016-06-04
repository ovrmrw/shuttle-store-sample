import { Injectable } from '@angular/core';

import { StoreController } from '../shuttle-store';
import { Identifiers } from '../services.ref';


////////////////////////////////////////////////////////////////////////////
// Service
@Injectable()
export class Page3Service {
  constructor(public SC: StoreController, private IR: Identifiers) { }
  private mainStore = this.SC.getStoreSafely();

  putCounter(data: number) { return this.mainStore.put(data, this.IR._COUNTER_, { limit: 100, rollback: true }); }
}


////////////////////////////////////////////////////////////////////////////
// State (Declared only getters from Store)
@Injectable()
export class Page3State {
  constructor(private SC: StoreController, private IR: Identifiers) { }
  private mainStore = this.SC.getStoreSafely();

  get title() { return this.mainStore.takeLatest<string>(this.IR._TITLE_); }

  get counter$() { return this.mainStore.takeLatest$<number>(this.IR._COUNTER_); }
}