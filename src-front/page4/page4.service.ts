import { Injectable } from '@angular/core';

import { Store, StoreService, StateRule } from '../shuttle-store';
import { Page1Service as P1S } from '../services.ref';
import { KeyInput } from '../types.ref';

const _KEYINPUT_ = ['keyinput', Page4Service];

////////////////////////////////////////////////////////////////////////////
// Service
@Injectable()
export class Page4Service extends StoreService {
  constructor(store: Store) { super(store); }

  setKeyInput(data: KeyInput) { this.store.setState(data, _KEYINPUT_, new StateRule({ limit: 100 })); }
}

// const P3S = Page3Service; // shorthand

////////////////////////////////////////////////////////////////////////////
// State (Declared only getters from Store)
@Injectable()
export class Page4State {
  constructor(private store: Store) { }

  get title() { return this.store.getState<string>(P1S.TITLE_IDENTIFIER); }

  get keyInputs$() { return this.store.getStates$<KeyInput>(_KEYINPUT_); }
}