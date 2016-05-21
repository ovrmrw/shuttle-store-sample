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
}