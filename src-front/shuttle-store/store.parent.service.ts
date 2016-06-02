import { ChangeDetectorRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx';
import lodash from 'lodash';

import { Store, _NOTIFICATION_ } from './store';
import { AbstractStoreState, StoreMulti } from './store.parent.state';

const LOCAL_STORAGE_KEY = 'ovrmrw-localstorage';
const GLOBAL_LOCAL_STORAGE_KEY = LOCAL_STORAGE_KEY + '_$global';


export abstract class AbstractStoreService extends AbstractStoreState {
  constructor(storeMulti: StoreMulti) {
    super(storeMulti);
  }


  // 全てのStoreのStateUpdateをComponentに通知する。
  // Componentはこのストリームを受けてcd.markForCheck()すればOnPush環境でViewを動的に更新できる。  
  get storeNotificator$$() {
    // return this.mainStore.takeLatest$(_NOTIFICATION_); 
    const observables = this.stores.map(store => store.takeLatest$(_NOTIFICATION_));
    return Observable
      .merge(...observables)
      .debounceTime(10); // あまり細かくストリームを流す必要もないのでdebounceTime
  }


  set disposableSubscription(subscription: Subscription) {
    this.mainStore.setDisposableSubscription(subscription, [this]);
  }
  set disposableSubscriptions(subscriptions: Subscription[]) {
    subscriptions.forEach(subscription => {
      this.disposableSubscription = subscription;
    });
  }


  // ComponentのngOnInitで呼び出される。
  // 前回登録したSubscriptionを全てunsubscribeし、新たにStoreのStateUpdateをComponentに通知するストリームを登録する。
  // これによりStoreに何か変更があったときにViewを更新することができる。
  initializeSubscriptionsOnInit(cd: ChangeDetectorRef) {
    this.mainStore.disposeSubscriptions([this]);
    if (cd) {
      this.disposableSubscription = this.storeNotificator$$.subscribe(() => cd.markForCheck());
    }
  }


  // Undo。
  rollback(options?: { keepSuspend?: boolean }) {
    const {keepSuspend} = options || { keepSuspend: false };
    this.mainStore.rollback(keepSuspend);
  }


  // Rollbackを元に戻す。つまりRedo。
  revertRollback(options?: { keepSuspend?: boolean }) {
    const {keepSuspend} = options || { keepSuspend: false };
    this.mainStore.revertRollback(keepSuspend);
  }


  // サスペンドモードのままになっている場合、元に戻さないとComponentにPushが来ない。
  revertSuspend() {
    this.mainStore.revertSuspend();
  }


  clearAllStatesAndAllStorages(): void {
    // this.store.clearStatesAndStorage();
    this.stores.forEach(store => {
      store.clearStatesAndStorage();
    });
  }








  //////////////////////////////////////////////////////////////////////////////////
  // DEPRECATED

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