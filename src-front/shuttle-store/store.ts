import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, Subscription } from 'rxjs/Rx';
// import { Observable } from 'rxjs/Observable';
// import { Subject } from 'rxjs/Subject';
// import { BehaviorSubject } from 'rxjs/BehaviorSubject';
// import { Subscription } from 'rxjs/Subscription';
// import { Scheduler } from 'rxjs/Scheduler';
// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/filter';
// import 'rxjs/add/operator/debounceTime';
// import 'rxjs/add/observable/from';
// import 'rxjs/add/operator/do';
import lodash from 'lodash';

type Nameable = Function | Object | string;
type StateObject = { string?: any };
type SubscriptionObject = { string?: Subscription };
type RuleObject = { string?: StateRule };

const LOCAL_STORAGE_KEY = 'ovrmrw-localstorage-store';
const DEFAULT_LIMIT = 1000;
const IDENTIFIER_PREFIX = '#';
const TIMESTAMP = 'timestamp';

@Injectable()
export class Store {
  private states: StateObject[];
  private subscriptions: SubscriptionObject[] = [];
  private rule: RuleObject = {};
  private _dispatcher$: Subject<any> = new Subject<any>();
  private _localStorageKeeper$: Subject<StateObject[]> = new Subject<StateObject[]>();
  private _returner$: BehaviorSubject<StateObject[]>;

  constructor() {
    let objFromLS: StateObject[] = [];
    try {
      console.time('localStorageGetItem');
      objFromLS = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY));
      console.timeEnd('localStorageGetItem');
    } catch (err) {
      console.error(err);
    }
    this.states = objFromLS;
    this._returner$ = new BehaviorSubject(this.states);

    this._dispatcher$
      .subscribe(newState => {
        this.states.push(newState);
        // this.states = gabageCollector(this.states, this.rule);
        this.states = gabageCollectorFastTuned(this.states, this.rule);
        // console.log('↓ states array on Store ↓');
        // console.log(this.states);
        this._returner$.next(this.states);
        this._localStorageKeeper$.next(this.states);
      });

    // debounceTimeで頻度を抑えながらLocalStorageに保存する。
    this._localStorageKeeper$
      .debounceTime(250)
      .subscribe(stateObjects => {
        try {
          console.time('localStorageSetItem');
          window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateObjects));
          console.timeEnd('localStorageSetItem');
        } catch (err) {
          console.error(err);
        }
      });
  }

  // (Componentで)戻り値を.log()するとセットされたStateをコンソールに出力できる。
  setState(data: any, nameablesAsIdentifier: Nameable[], rule?: StateRule): ReturnOfSetState {
    const identifier = generateIdentifier(nameablesAsIdentifier);
    let obj = {};
    obj[identifier] = lodash.cloneDeep(data);
    obj[TIMESTAMP] = lodash.now();
    if (rule) { // Stateの管理に特別なルールが必要な場合はここでルールを保持する。
      this.rule[identifier] = rule;
    }
    this._dispatcher$.next(obj);
    return { state: obj, rule: rule, log: loggerForSetState };
  }

  getStates<T>(nameablesAsIdentifier: Nameable[], limit: number = DEFAULT_LIMIT): T[] {
    const identifier = generateIdentifier(nameablesAsIdentifier);
    const states = this.states
      .filter(obj => obj && identifier in obj)
      .map(obj => pickValueFromObject(obj));
    if (states.length > 0) {
      const _limit = limit && limit > 0 ? limit : 1;
      return states.reverse().slice(0, _limit) as T[];
    } else {
      return [] as T[];
    }
  }

  getState<T>(nameablesAsIdentifier: Nameable[]): T {
    const ary = this.getStates<T>(nameablesAsIdentifier, 1);
    const state = ary && ary.length > 0 ? ary[0] : null;
    return state;
  }

  getStates$<T>(nameablesAsIdentifier: Nameable[], limit: number = DEFAULT_LIMIT): Observable<T[]> {
    const identifier = generateIdentifier(nameablesAsIdentifier);
    return this._returner$
      .map(objs => {
        return objs.filter(obj => obj && identifier in obj);
      })
      .map(objs => {
        return objs.map(obj => pickValueFromObject(obj));
      })
      .map(states => {
        const _limit = limit && limit > 0 ? limit : DEFAULT_LIMIT;
        return states.reverse().slice(0, _limit) as T[];
      });
  }

  getState$<T>(nameablesAsIdentifier: Nameable[]): Observable<T> {
    return this.getStates$<T>(nameablesAsIdentifier, 1)
      .map(states => {
        return (states.length > 0 ? states[0] : null);
      });
  }

  // ただの配列を時間軸のある値のストリームに変換して流す。後続はinterval毎に配列の値を順々に受け取る。
  // states: [a,b,c,d,e] (this.states)
  // input: [e,c,a]
  // output: |--a--c--e-->
  // output: |--e--c--a--> (if descending is true)
  getPresetReplayStream$<T>(nameablesAsIdentifier: Nameable[], limit: number, interval: number, descending?: boolean): Observable<T> {
    const _interval = interval && interval > 0 ? interval : 1;
    return this.getStates$<T>(nameablesAsIdentifier, limit)
      .map(states => states.length > 0 ? states : [null]) // statesが空配列だとsubscribeまでストリームが流れないのでnull配列を作る。
      .map(states => descending ? states : states.reverse())
      .switchMap(states => { // switchMapは次のストリームが流れてくると"今流れているストリームをキャンセルして"新しいストリームを流す。
        return Observable.timer(1, _interval)
          .map(x => states[x])
          .take(states.length);
      });
  }

  // ただの配列を時間軸のある配列のストリームに変換して流す。後続はinterval毎に要素が順々に増えていく配列を受け取る。
  // states: [a,b,c,d,e] (this.states)
  // input: [e,c,a]
  // output: |--[a]--[a,c]--[a,c,e]-->
  // output: |--[e]--[e,c]--[e,c,a]--> (if descending is true)
  getPresetReplayArrayStream$<T>(nameablesAsIdentifier: Nameable[], limit: number, interval: number, descending?: boolean): Observable<T[]> {
    const _interval = interval && interval > 0 ? interval : 1;
    let ary = [];
    return this.getStates$<T>(nameablesAsIdentifier, limit)
      .do(() => ary = [])
      .map(states => states.length > 0 ? states : [null]) // statesが空配列だとsubscribeまでストリームが流れないのでnull配列を作る。
      .map(states => descending ? states : states.reverse())
      .switchMap(states => { // switchMapは次のストリームが流れてくると"今流れているストリームをキャンセルして"新しいストリームを流す。
        return Observable.timer(1, _interval)
          .map(x => {
            ary.push(states[x]);
            return ary;
          })
          .take(states.length);
      });
  }

  setDisposableSubscription(subscription: Subscription, nameablesAsIdentifier: Nameable[]): void {
    const identifier = generateIdentifier(nameablesAsIdentifier);
    let obj = {};
    obj[identifier] = subscription;
    this.subscriptions.push(obj);
  }

  disposeSubscriptions(nameablesAsIdentifier: Nameable[] = [this]): void {
    const identifier = generateIdentifier(nameablesAsIdentifier);
    this.subscriptions
      .filter(obj => obj && identifier in obj)
      .map(obj => pickValueFromObject(obj))
      .forEach(subscription => {
        subscription.unsubscribe();
      });
    const aliveSubscriptions = this.subscriptions
      .filter(obj => {
        const subscription = pickValueFromObject(obj);
        if (subscription && !subscription.isUnsubscribed) {
          return true;
        }
      });
    this.subscriptions = null;
    this.subscriptions = aliveSubscriptions;
    // console.log('↓ subscriptions array on Store ↓');
    // console.log(this.subscriptions);
  }

  clearStatesAndLocalStorage(): void {
    try {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (err) {
      console.error(err);
    }
    this.states = null;
    this.states = [];
    this._dispatcher$.next(null);
  }
}


function gabageCollector(stateObjects: StateObject[], ruleObject: RuleObject, maxElementsByKey: number = DEFAULT_LIMIT): StateObject[] {
  console.time('gabageCollector');
  const keys = stateObjects.filter(obj => obj && typeof obj === 'object').map(obj => Object.keys(obj)[0]);
  const uniqKeys = lodash.uniq(keys);
  // console.log('Keys: ' + uniqKeys.join(', '));
  let newObjs: StateObject[] = [];

  // key毎に保存最大数を超えたものをカットして新しい配列を作る。
  uniqKeys.forEach(identifier => {
    const objs = stateObjects.filter(obj => obj && identifier in obj);
    const maxHistory = identifier in ruleObject ? (<StateRule>ruleObject[identifier]).limit : maxElementsByKey;
    if (objs.length > maxHistory) {
      objs.reverse().slice(0, maxHistory).reverse().forEach(obj => newObjs.push(obj));
    } else {
      objs.forEach(obj => newObjs.push(obj));
    }
  });
  console.timeEnd('gabageCollector');
  return newObjs;
}

// gabageCollectorの処理速度が高速になるようにチューニングしたもの。10倍近く速い。
// 参考: http://qiita.com/keroxp/items/67804391a8d65eb32cb8
function gabageCollectorFastTuned(stateObjects: StateObject[], ruleObject: RuleObject, limit: number = DEFAULT_LIMIT): StateObject[] {
  console.time('gabageCollectorFastTuned');
  // const keys = stateObjects.filter(obj => obj && typeof obj === 'object').map(obj => Object.keys(obj)[0]);
  let keys: string[] = [];
  // let i = 0;
  for (let i = 0; i < stateObjects.length; i = (i + 1) | 0) {
    const stateObject = stateObjects[i];
    if (stateObject && typeof stateObject === 'object') {
      keys.push(Object.keys(stateObject)[0]);
    }
    // i = (i + 1) | 0;
  }
  const uniqKeys = lodash.uniq(keys);
  // console.log('Keys: ' + uniqKeys.join(', '));
  let newObjs: StateObject[] = [];

  // key毎に保存最大数を超えたものをカットして新しい配列を作る。
  // uniqKeys.forEach(key => {
  //   const objs = stateObjects.filter(obj => obj && key in obj);
  //   if (objs.length > maxElementsByKey) {
  //     objs.reverse().slice(0, maxElementsByKey).reverse().forEach(obj => newObjs.push(obj));
  //   } else {
  //     objs.forEach(obj => newObjs.push(obj));
  //   }
  // });
  // let j = 0;
  for (let j = 0; j < uniqKeys.length; j = (j + 1) | 0) {
    // const objs = stateObjects.filter(obj => obj && uniqKeys[i] in obj);
    const identifier = uniqKeys[j];
    let objs: StateObject[] = [];
    // let k = 0;
    for (let k = 0; k < stateObjects.length; k = (k + 1) | 0) {
      const stateObject = stateObjects[k];
      if (identifier in stateObject) {
        objs.push(stateObject);
      }
      // k = (k + 1) | 0;
    }

    // StateRuleが保持されている場合、最大保存数を差し替える。
    const _limit = identifier in ruleObject ? (<StateRule>ruleObject[identifier]).limit : limit;

    if (objs.length > _limit) {
      // objs.reverse().slice(0, maxElementsByKey).reverse().forEach(obj => newObjs.push(obj));
      const ary = objs.reverse().slice(0, _limit).reverse(); // TODO:もっとやりようがある。
      // let l = 0;
      for (let l = 0; l < ary.length; l = (l + 1) | 0) {
        newObjs.push(ary[l]);
        // l = (l + 1) | 0;
      }
    } else {
      // objs.forEach(obj => newObjs.push(obj));
      // let l = 0;
      for (let l = 0; l < objs.length; l = (l + 1) | 0) {
        newObjs.push(objs[l]);
        // l = (l + 1) | 0;
      }
    }
    // j = (j + 1) | 0;
  }
  console.timeEnd('gabageCollectorFastTuned');
  return newObjs;
}

function generateIdentifier(nameables: Nameable[]): string {
  let ary: string[] = [IDENTIFIER_PREFIX];

  nameables.reduce((p: string[], nameable) => {
    if (nameable && typeof nameable === 'string') {
      p.push(nameable);
    } else if (nameable && typeof nameable === 'function') {
      p.push(nameable.name);
    } else if (nameable && typeof nameable === 'object') {
      p.push(nameable.constructor.name);
    } else {
      p.push('###');
    }
    return p;
  }, ary);

  return ary.join('_');
}

function pickValueFromObject<T>(obj: { string?: T }): T {
  try {
    const key = Object.keys(obj).filter(key => key.startsWith(IDENTIFIER_PREFIX))[0];
    return obj[key] as T;
  } catch (err) {
    return obj as T;
  }
}

function loggerForSetState(message?: string) {
  if (message) { console.log('===== ' + message + ' ====='); }
  let obj = {};
  Object.keys(this).filter(key => key !== 'log').forEach(key => obj[key] = this[key]);
  console.log(obj);
}


////////////////////////////////////////////////////////////////////////////
// StateRule Class
export class StateRule {
  limit: number;
  constructor(options: StateRuleOptions) {
    const opts = options; // shorthand
    if (opts.limit && opts.limit > 0) {
      this.limit = opts.limit;
    } else {
      this.limit = DEFAULT_LIMIT;
    }
  }
}

interface StateRuleOptions {
  limit?: number;
}

interface ReturnOfSetState {
  state: StateObject,
  rule: StateRule,
  log: (string?) => void
}