import { Subscription } from 'rxjs/Subscription';
import lodash from 'lodash';

import { Store, _NOTIFICATION_ } from './store';
import { AbstractStoreState, StoreMulti } from './store.state';

const LOCAL_STORAGE_KEY = 'ovrmrw-localstorage';
const GLOBAL_LOCAL_STORAGE_KEY = LOCAL_STORAGE_KEY + '_$global';

export abstract class AbstractStoreService extends AbstractStoreState {
  // protected store: Store;
  // private storesObject: { [key: string]: Store };

  // constructor(
  //   private stores: StoreMulti
  // ) {
  //   this.store = stores instanceof Array ? stores[0] : stores;

  //   if (stores instanceof Array) {
  //     const keys = stores.map(s => s.key);
  //     this.storesObject = lodash.zipObject(keys, stores) as { [key: string]: Store };
  //   } else {
  //     this.storesObject = { [stores.key]: stores };
  //   }
  //   console.log(this.storesObject);
  // }

  // getStoreSafely(key: string) {
  //   try {
  //     return this.storesObject[key];
  //   } catch (err) {
  //     return this.store;
  //   }
  // }
  constructor(stores: StoreMulti) { super(stores); }

  // Componentはこのストリームを受けてcd.markForCheck()すればOnPush環境でViewを動的に更新できる。
  get storeNotificator$$() { return this.store.takeLatest$(_NOTIFICATION_); }

  set disposableSubscription(subscription: Subscription) {
    this.store.setDisposableSubscription(subscription, [this]);
  }
  set disposableSubscriptions(subscriptions: Subscription[]) {
    subscriptions.forEach(subscription => {
      this.disposableSubscription = subscription;
    });
  }

  disposeSubscriptionsBeforeRegister() {
    this.store.disposeSubscriptions([this]);
  }

  clearStatesAndStorage() {
    this.store.clearStatesAndStorage();
  }


  // 引数のタイムスタンプまでStateを戻す。つまりUndo。
  rollback(options?: { withCommit?: boolean }) {
    const {withCommit} = options;
    this.store.rollback(withCommit);
  }

  // Rollbackを元に戻す。つまりRedo。
  revertRollback(options?: { withCommit?: boolean }) {
    const {withCommit} = options;
    this.store.revertRollback(withCommit);
  }

  // サスペンドモードのままになっている場合、元に戻さないとComponentにPushが来ない。
  revertSuspend() {
    this.store.revertSuspend();
  }



  // DEPRECATED
  // NOT RECOMMENDED TO USE
  savePrimitiveValuesToLocalStorage(component: Object, ignores?: Object[]): void {
    let obj = {};
    let objGlobal = {};
    Object.keys(component).forEach(key => {
      if (key.includes('_global')) {
        objGlobal[key] = component[key];
      } else if (typeof component[key] === 'object') {
        const ctorName = component[key].constructor.name;
        const ignorable = ignores && ignores.length > 0 ? ignores.some(ignore => ctorName === ignore.constructor.name) : false;
        if (!ignorable) {
          obj[key] = component[key];
        }
      } else {
        obj[key] = component[key];
      }
    });
    try {
      const key = LOCAL_STORAGE_KEY + '-' + component.constructor.name;
      window.localStorage.setItem(key, JSON.stringify(obj));
    } catch (err) {
      console.error(err);
    }
    try {
      let ls = window.localStorage.getItem(GLOBAL_LOCAL_STORAGE_KEY);
      ls = ls ? JSON.parse(ls) : {};
      objGlobal = lodash.defaultsDeep(objGlobal, ls);
      window.localStorage.setItem(GLOBAL_LOCAL_STORAGE_KEY, JSON.stringify(objGlobal));
    } catch (err) {
      console.error(err);
    }
  }

  // DEPRECATED
  // NOT RECOMMENDED TO USE
  loadPrimitiveValuesFromLocalStorage(component: Object): void {
    let json = '{}';
    let jsonGlobal = '{}';
    try {
      const key = LOCAL_STORAGE_KEY + '-' + component.constructor.name;
      json = window.localStorage.getItem(key);
      jsonGlobal = window.localStorage.getItem(GLOBAL_LOCAL_STORAGE_KEY);
    } catch (err) {
      console.error(err);
    }
    let obj = JSON.parse(json) as { string?: any };
    obj = lodash.defaultsDeep(obj, JSON.parse(jsonGlobal));
    // console.log(obj);
    Object.keys(obj).forEach(key => {
      if (!component[key]) {
        component[key] = obj[key];
      }
    });
  }
}