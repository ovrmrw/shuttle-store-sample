import { Store } from './store';
import lodash from 'lodash';

export type StoreMulti = Store | Store[];

export abstract class AbstractStoreState {
  protected mainStore: Store;
  private storesObject: { [key: string]: Store };
  private storesArray: Store[];

  constructor(
    private storeMulti: StoreMulti
  ) {
    this.mainStore = storeMulti instanceof Array ? storeMulti[0] : storeMulti;

    if (storeMulti instanceof Array) {
      const stores = storeMulti; // rename
      const keys = stores.map(s => s.key);
      this.storesObject = lodash.zipObject(keys, stores) as { [key: string]: Store };
      this.storesArray = stores;
    } else {
      const store = storeMulti; // rename
      this.storesObject = { [store.key]: store };
      this.storesArray = [store];
    }
    console.log('===== storesObject =====');
    console.log(this.storesObject);
    console.log('===== storesArray =====');
    console.log(this.storesArray);
  }

  getStoreSafely(key: string): Store {
    // try {
    //   return key ? this.storesObject[key] : this.store;
    // } catch (err) {
    //   return this.store;
    // }
    if (key && key in this.storesObject) {
      return this.storesObject[key];
    } else {
      return this.mainStore;
    }
  }

  get stores(): Store[] { return this.storesArray; }
}