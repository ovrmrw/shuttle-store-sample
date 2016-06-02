import { Store } from './store';
import lodash from 'lodash';

export type StoreMulti = Store | Store[];


export abstract class AbstractStoreState {
  // AutoRefreshStateが確実に一度だけ登録されるようにstatic変数で制御する。
  static isFirstLoad: boolean = true;

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
    if (AbstractStoreState.isFirstLoad) {
      console.log('===== storesObject =====');
      console.log(this.storesObject);
      console.log('===== storesArray =====');
      console.log(this.storesArray);
    }

    this.addEventListnerForAutoRefreshState();

    AbstractStoreState.isFirstLoad = false;
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


  // ブラウザのタブ切り替えをしたときに自動的にStateを更新する。
  // 下記によると多重にaddEventListnerしても二度目からはdiscardされるので重複はしないとのこと。
  // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
  private addEventListnerForAutoRefreshState(): void {
    if (AbstractStoreState.isFirstLoad) {
      try {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            // this.store.refresh().then(x => x.log('View State Refresh'));
            this.stores.forEach(store => {
              store.refresh().then(x => x.log('View State Refresh Request'));
            });
          }
        }, false);
      } catch (err) {
        console.log(err);
      }
    }
  }
}