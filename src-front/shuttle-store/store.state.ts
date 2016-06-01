import { Store } from './store';
import lodash from 'lodash';

export type StoreMulti = Store | Store[];

export abstract class AbstractStoreState {
  protected store: Store;
  private storesObject: { [key: string]: Store };
  private storesArray: Store[];

  constructor(
    private stores: StoreMulti
  ) {
    this.store = stores instanceof Array ? stores[0] : stores;

    if (stores instanceof Array) {
      const keys = stores.map(s => s.key);
      this.storesObject = lodash.zipObject(keys, stores) as { [key: string]: Store };
      this.storesArray = stores;
    } else {
      const store = stores; // rename
      this.storesObject = { [store.key]: store };
      this.storesArray = [store];
    }
    console.log('===== StoresObject =====');
    console.log(this.storesObject);
  }

  getStoreSafely(key?: string): Store {
    // try {
    //   return key ? this.storesObject[key] : this.store;
    // } catch (err) {
    //   return this.store;
    // }
    if (key && key in this.storesObject) {
      return this.storesObject[key];
    } else {
      return this.store;
    }
  }

  getStoreArray(): Store[] { return this.storesArray; }
}