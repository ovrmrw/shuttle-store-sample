import { ShuttleStore } from './store';

export interface ComponentGuidelineUsingStore {
  // isSubscriptionsRegistered: boolean;
  registerSubscriptionsEveryEntrance: () => void;
  registerSubscriptionsOnlyOnce?: () => void;
}
