import { Store } from './store';

export interface ComponentGuidelineUsingStore {
  // isSubscriptionsRegistered: boolean;
  registerSubscriptionsEveryActivate: () => void;
  registerSubscriptionsOnlyOnce?: () => void;
}
