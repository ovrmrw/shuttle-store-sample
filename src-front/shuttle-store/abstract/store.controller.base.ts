import { Store } from '../store';
import lodash from 'lodash';

import { logConstructorName } from '../store.helper';

export type StoreMulti = Store | Store[];


export abstract class AbstractStoreControllerBase {
  // AutoRefreshStateが確実に一度だけ登録されるようにstatic変数で制御する。
  static isFirstLoad: boolean = true;

  protected mainStore: Store;
  private storesObject: { [key: string]: Store };
  private storesArray: Store[];


  constructor(
    private storeMulti: StoreMulti
  ) {
    logConstructorName.call(this);
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
    if (AbstractStoreControllerBase.isFirstLoad) {
      console.log('===== storesObject =====');
      console.log(this.storesObject);
      console.log('===== storesArray =====');
      console.log(this.storesArray);
    }

    this.addEventListnerForAutoRefreshState();

    AbstractStoreControllerBase.isFirstLoad = false;
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
      return this.mainStore;
    }
  }


  get stores(): Store[] { return this.storesArray; }


  // ブラウザのタブ切り替えをしたときに自動的にStateを更新する。
  // 下記によると多重にaddEventListnerしても二度目からはdiscardされるので重複はしないとのこと。
  // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
  private addEventListnerForAutoRefreshState(): void {
    if (AbstractStoreControllerBase.isFirstLoad) {
      try {
        // ブラウザタブ切り替えで入ったときに発火するイベント。
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') { // タブが少しでも見えている状態ならtrueになる。
            this.stores.forEach(store => {
              store.refresh().then(x => x.log('View State Refresh Request by Tab Change event'));
            });
          }
        }, false);
      } catch (err) {
        console.log(err);
      }

      try {
        // LocalStorageに変更があったときに発生するイベント。タブ切り替えをしていなくても発火する。
        // refreshの引数にstoreKeyを指定して、Storeのkeyと一致したらosnに変更がなくても強制的にrefreshする。
        window.addEventListener('storage', (event) => {
          if (document.visibilityState === 'visible' && !document.hasFocus()) { // タブが少しでも見えている状態ならtrueになる。
            const storeKey = event.key; // rename
            this.stores.forEach(store => {
              store.refresh(storeKey).then(x => x.log('View State Refresh Request by Storage Change event'));
            });
          }
        }, false);
      } catch (err) {
        console.log(err);
      }
    }
  }
}