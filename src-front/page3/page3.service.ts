import { Injectable } from '@angular/core';

import { Store } from '../shuttle-store';
import { AppService } from '../services.ref';

////////////////////////////////////////////////////////////////////////////
// Service
@Injectable()
export class Page3Service extends AppService {
  constructor(store: Store) { super(store); }
}

const S = Page3Service; // shorthand

////////////////////////////////////////////////////////////////////////////
// State (Declared only getters from Store)
@Injectable()
export class Page3State {
  constructor(private store: Store) { }

  get title() { return this.store.select<string>(S._TITLE_); }
}