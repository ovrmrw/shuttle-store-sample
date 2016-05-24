import { Injectable } from '@angular/core';

import { Store, StoreService, StateRule } from '../shuttle-store';
import { Page1Service as P1S } from '../services.ref';

////////////////////////////////////////////////////////////////////////////
// Service
@Injectable()
export class Page3Service extends StoreService {
  constructor(store: Store) { super(store); }
}

// const P3S = Page3Service; // shorthand

////////////////////////////////////////////////////////////////////////////
// State (Declared only getters from Store)
@Injectable()
export class Page3State {
  constructor(private store: Store) { }

  get title() { return this.store.getState<string>(P1S._TITLE_); }
}