import { Subscription } from 'rxjs/Rx';
import lodash from 'lodash';

import { Store, DEFAULT_LIMIT } from './store';

export type Nameable = Function | Object | string;
export type SnapShot = State[];
export type NameablesOrIdentifier = Nameable[] | string;

////////////////////////////////////////////////////////////////////////////
// State Class
export class State {
  key: string;
  value: any;
  osn: number;
  timestamp: number;
  rule: StateRule;
  constructor(options?: StateOptions) {
    if (options) {
      const {key, value, osn, ruleOptions} = options;
      this.key = key ? key : null;
      this.value = lodash.isUndefined(value) ? null : value;
      this.osn = osn;
      this.rule = ruleOptions ? new StateRule(ruleOptions) : null;
    } else {
      this.key = null;
      this.value = null;
      this.osn = null;
      this.rule = null;
    }
    this.timestamp = lodash.now();
  }
}
interface StateOptions {
  key: string;
  value: any;
  osn: number;
  ruleOptions: StateRuleOptions;
}


////////////////////////////////////////////////////////////////////////////
// StateRule Class
export class StateRule {
  limit: number;
  rollback: boolean;
  filterId: string | number;
  duration: number;
  lock: boolean;
  constructor(options: StateRuleOptions) {
    const {limit, rollback, filterId, duration, lock} = options;
    this.limit = limit && limit > 0 ? limit : DEFAULT_LIMIT;
    this.rollback = rollback ? true : false;
    this.filterId = filterId ? filterId : null;
    this.duration = duration ? duration : null;
    this.lock = lock ? true : false;
  }
}
export interface StateRuleOptions {
  limit?: number;
  rollback?: boolean;
  filterId?: string | number;
  duration?: number;
  lock?: boolean;
}


////////////////////////////////////////////////////////////////////////////
// Logger Class
export class Logger {
  constructor(private state: State | string, private _store?: Store) { }

  log(message?: string): void {
    const obj = Object.keys(this).reduce((p, key) => { // インスタンス変数が畳み込みの対象となる。
      if (!key.startsWith('_')) {
        p[key] = this[key];
      }
      return p;
    }, {});
    const _storeKey = this._store ? `(storeKey: ${this._store.key})` : '';

    if ((this._store && this._store.devMode) || !this._store) {
      const what = typeof this.state === 'string' ? 'Message from Store' : 'State Information from Store';
      if (message) {
        console.log(`===== ${what} ${_storeKey}: ${message} =====`);
      } else {
        console.log(`===== ${what} ${_storeKey} =====`);
      }
      console.log(obj);
    }
    // return obj;
  }
}


////////////////////////////////////////////////////////////////////////////
// DisposableSubscription Class
export class DisposableSubscription {
  key: string;
  value: Subscription;
  constructor(options: DisposableSubscriptionOptions) {
    const {key, value} = options;
    this.key = key ? key : null;
    this.value = value ? value : null;
  }
}
interface DisposableSubscriptionOptions {
  key: string;
  value: Subscription;
}


////////////////////////////////////////////////////////////////////////////
// Interfaces
export interface ReplayStreamOptions {
  interval?: number;
  limit?: number;
  descending?: boolean;
  truetime?: boolean;
}