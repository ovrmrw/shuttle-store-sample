import { Subscription } from 'rxjs/Subscription';
import { Store } from './store';

export class StoreService {
  constructor(
    protected store: Store
  ) { }

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

  clearStatesAndLocalStorage() {
    this.store.clearStatesAndLocalStorage();
  }

  savePrimitiveValuesToLocalStorage(component: Object, ignores?: Object[]): void {
    let obj = {};
    Object.keys(component).forEach(name => {
      if (typeof component[name] === 'object') {
        const ctorName = component[name].constructor.name;
        const ignorable = ignores && ignores.length > 0 ? ignores.some(ignore => ctorName === ignore.constructor.name) : false;
        if (!ignorable) {
          obj[name] = component[name];
        }
      } else {
        obj[name] = component[name];
      }
    });
    try {
      window.localStorage.setItem(component.constructor.name, JSON.stringify(obj));
    } catch (err) {
      console.error(err);
    }
  }

  loadPrimitiveValuesFromLocalStorage(component: Object): void {
    let json = '{}';
    try {
      json = window.localStorage.getItem(component.constructor.name);
    } catch (err) {
      console.error(err);
    }
    const obj = JSON.parse(json) as { string?: any };
    Object.keys(obj).forEach(key => component[key] = obj[key]);
  }
}