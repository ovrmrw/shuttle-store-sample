import { Injectable } from '@angular/core';

import { StoreController } from '../shuttle-store';
import { Identifiers } from '../services.ref';


////////////////////////////////////////////////////////////////////////////
// Service
@Injectable()
export class Page3Service {
  constructor(public SC: StoreController) { }
}


////////////////////////////////////////////////////////////////////////////
// State (Declared only getters from Store)
@Injectable()
export class Page3State {
  constructor(private SC: StoreController, private IR: Identifiers) { }
  private mainStore = this.SC.getStoreSafely(); // MainStoreを取得

  get title() { return this.mainStore.takeLatest<string>(this.IR._TITLE_); }
}