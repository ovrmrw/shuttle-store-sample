import { Injectable } from '@angular/core';

import { Store, StoreService, StateRule } from '../shuttle-store';
import { Page1Service as P1S } from '../services.ref';
import { KeyInput } from '../types.ref';

////////////////////////////////////////////////////////////////////////////
// Service
@Injectable()
export class Page4Service extends StoreService {
  static _KEYINPUT_ = ['keyinput', Page4Service];
  static _UNIQUEID_ = ['uniqueid', Page4Service];

  constructor(store: Store) { super(store); }

  setKeyInput(data: KeyInput) { return this.store.setState(data, S._KEYINPUT_, new StateRule({ limit: 100 })); }
  setUniqueId(data: string) { return this.store.setState(data, S._UNIQUEID_); }
}

const S = Page4Service; // shorthand

////////////////////////////////////////////////////////////////////////////
// State (Declared only getters from Store)
@Injectable()
export class Page4State {
  constructor(private store: Store) { }

  get title() { return this.store.getState<string>(P1S._TITLE_); }

  get keyInputs$() { return this.store.getStates$<KeyInput>(S._KEYINPUT_); }

  get uniqueId() { return this.store.getState<string>(S._UNIQUEID_); }
}