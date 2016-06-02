import { Injectable } from '@angular/core';

import { Store } from '../shuttle-store';
import { AppService, AppState } from '../services.ref';


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
export class Page3State extends AppState {
  constructor(store: Store) { super(store); }

  get title() { return this.mainStore.takeLatest<string>(S._TITLE_); }
}