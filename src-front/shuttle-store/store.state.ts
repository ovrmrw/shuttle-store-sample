import { Store } from './store';
import lodash from 'lodash';

export type StoreMulti = Store | Store[];

export abstract class AbstractStoreState {
  protected store: Store;
  private storesObject: { [key: string]: Store };
  
  constructor(
    private stores: StoreMulti
  ) {
    this.store = stores instanceof Array ? stores[0] : stores;

    if (stores instanceof Array) {
      const keys = stores.map(s => s.key);
      this.storesObject = lodash.zipObject(keys, stores) as { [key: string]: Store };
    } else {
      this.storesObject = { [stores.key]: stores };
    }
    console.log('===== StoresObject =====');
    console.log(this.storesObject);    
  }

  getStoreSafely(key: string) {
    try {
      return this.storesObject[key];
    } catch (err) {
      return this.store;
    }
  }
}