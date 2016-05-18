import { Subscription } from 'rxjs/Subscription';
import { ShuttleStore } from './store';

export class ShuttleStoreService {
  constructor(
    protected store: ShuttleStore
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