import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { ShuttleStore, ShuttleStoreService } from '../store';
import { AppPage1Service as AP1S } from '../services.ref';
import { Translation } from '../types.ref';

const PAGETITLE = 'page-title';

////////////////////////////////////////////////////////////////////////////
// Service
@Injectable()
export class AppPage2Service extends ShuttleStoreService {
  static PAGETITLE_IDENTIFIER = [PAGETITLE, AppPage2Service];

  constructor(store: ShuttleStore) { super(store); }

  setTitle(title: string) { this.store.setState(title, AP2S.PAGETITLE_IDENTIFIER); }
}

const AP2S = AppPage2Service;

////////////////////////////////////////////////////////////////////////////
// State (Declared only getters from Store)
@Injectable()
export class AppPage2State {
  constructor(private store: ShuttleStore) { }

  get title() { return this.store.getState<string>(AP2S.PAGETITLE_IDENTIFIER); }
  get titles$() { return this.store.getStates$<string>(AP2S.PAGETITLE_IDENTIFIER); }
  get titleReplayStream$$() { return this.store.getPresetReplayStream$<string>(AP2S.PAGETITLE_IDENTIFIER, 100, 25); }

  get translations$$() { return this.store.getStates$<Translation>(AP1S.TRANSLATION_IDENTIFIER); }
}