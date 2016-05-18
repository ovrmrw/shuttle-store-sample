import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { ShuttleStore, ShuttleStoreService } from '../store';
import { AppPage1Service as AP1S, AppPage2Service as AP2S } from '../services.ref';
import { Translation } from '../types.ref';

////////////////////////////////////////////////////////////////////////////
// Service
@Injectable()
export class AppPage3Service extends ShuttleStoreService {
  constructor(store: ShuttleStore) { super(store); }
}

////////////////////////////////////////////////////////////////////////////
// State (Declared only getters from Store)
@Injectable()
export class AppPage3State {
  constructor(private store: ShuttleStore) { }

  get texts() { return this.store.getStates<string>(AP1S.TRANSLATION_TEXTINPUT_IDENTIFIER); }
  get textReplayStream$$() { return this.store.getPresetReplayStream$<string>(AP1S.TRANSLATION_TEXTINPUT_IDENTIFIER, null, 25); }


  get title() { return this.store.getState<string>(AP2S.PAGETITLE_IDENTIFIER); }
  get titles() { return this.store.getStates<string>(AP2S.PAGETITLE_IDENTIFIER); }
  get titles$() { return this.store.getStates$<string>(AP2S.PAGETITLE_IDENTIFIER); }
  get titleReplayStream$$() { return this.store.getPresetReplayStream$<string>(AP2S.PAGETITLE_IDENTIFIER, null, 25); }
}