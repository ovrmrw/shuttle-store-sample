import { Injectable } from '@angular/core';

import { Store } from './store';
import { AbstractStoreController } from './abstract/store.controller';


@Injectable()
export class StoreController extends AbstractStoreController {
  constructor(storeOrStores: Store) { super(storeOrStores); }
}