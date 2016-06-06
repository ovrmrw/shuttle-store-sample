import { Injectable, Inject } from '@angular/core';

import { Store } from './store';
import { AbstractStoreController } from './abstract/store.controller';


@Injectable()
export class StoreController extends AbstractStoreController {
  constructor(
    @Inject(Store) storeOrStores: Store | Store[]
  ) { super(storeOrStores); }
}