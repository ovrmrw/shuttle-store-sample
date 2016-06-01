import { Injectable } from '@angular/core';
// import { Http, Headers } from '@angular/http';
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
import levelup from 'levelup';
const leveljs = require('level-js');

type Nameable = Function | Object | string;
type SnapShot = State[];

// const LOCAL_STORAGE_KEY = 'ovrmrw-localstorage-store';
const LEVELDB_NAME = 'ovrmrw-shuttle-store';
const LEVELDB_KEY = 'states';
const DEFAULT_LIMIT = 1000;
const DEFAULT_INTERVAL = 10;
export const _NOTIFICATION_ = ['push-notification-from-store-to-client'];

@Injectable()
export class Store {
  private states: State[] = [];
  private osnLatest: number = null; // ObjectSequenceNumber
  private subscriptions: DisposableSubscription[] = [];
  private snapShots: SnapShot[] = [];
  private _dispatcher$: Subject<any> = new Subject<any>();
  private _storageKeeper$: Subject<State[]> = new Subject<State[]>();
  private _returner$: BehaviorSubject<State[]>;
  private isReady: boolean = false;
  private autoRefresh: boolean = false;

  private storeKey: string;
  private leveldbStatesKey: string;
  private leveldbOsnKey: string;

  // サスペンドで使う変数群。
  private isSuspending: boolean = false;
  private tempStates: State[] = [];

  get key() { return this.storeKey; }

  constructor(options?: {
    storeKey?: string;
    autoRefresh?: boolean;
  }) {
    const {storeKey, autoRefresh} = options || { storeKey: '', autoRefresh: false };
    this.storeKey = storeKey || '__default__';
    this.leveldbStatesKey = LEVELDB_KEY + '-' + this.storeKey;
    this.leveldbOsnKey = this.leveldbStatesKey + '-osn';
    this.autoRefresh = autoRefresh ? true : false;
    // try { // LevelDBからデータを取得する。
    //   console.time('levelDbGetItem');
    //   this.http.get('/leveldb')
    //     .map(res => res.json() as string)
    //     .map(json => (json ? JSON.parse(json) : this.states) as State[])
    //     .do(states => {
    //       this.states = states;
    //       this.osnLatest = lodash.max(this.states.filter(obj => !!obj).map(obj => obj.osn)) || 0;
    //       this._dispatcher$.next(new State({ key: NOTIFICATOR, value: true, osn: this.osnLatest++, ruleOptions: new StateRule({ limit: 1 }) })); // statesをロードしたらクライアントにPush通知する。
    //     })
    //     .subscribe(() => console.timeEnd('levelDbGetItem'), err => console.log(err));
    // } catch (err) {
    //   console.log(err);
    // }
    try { // IndexedDB(level-js)からデータを取得する。
      console.time('IndexedDB(level-js)GetItem');
      const db = levelup(LEVELDB_NAME, { db: leveljs });
      db.get(this.leveldbStatesKey, (err, value) => {
        if (err) { console.log(err); }
        console.timeEnd('IndexedDB(level-js)GetItem');
        const states: State[] = value ? JSON.parse(value) : this.states;
        this.states = states;
        // this.osnLatest = lodash.max(this.states.filter(obj => !!obj).map(obj => obj.osn)) || 1; // 0だとput関数の中で躓く。
        this.isReady = true;

        this.put('ready', _NOTIFICATION_, { limit: 1, duration: 1000 }).then(x => x.log('Store is now on ready!')); // statesをロードしたらクライアントにPush通知する。
      });
    } catch (err) {
      console.log(err);
    }

    // ComponentはこのSubjectのストリームを受けることでViewを動的に更新する。
    this._returner$ = new BehaviorSubject(this.states);

    // 主にput関数から呼ばれ、新しいStateをStoreに追加しつつComponentにPush通知する。
    this._dispatcher$
      .subscribe(newState => {
        if (newState instanceof State) { // nullがthis.statesにpushされないように制御する。
          this.states.push(newState);
          this.snapShots = []; // this.statesに新しい値がpushされたらsnapshotsは初期化する。       
        }
        // this.states = gabageCollector(this.states, this.rule);
        this.states = gabageCollectorFastTuned(this.states);
        // console.log('↓ states array on Store ↓');
        // console.log(this.states);
        this._returner$.next(this.states);
        this._storageKeeper$.next(this.states);
      });

    // debounceTimeで頻度を抑えながらStorageにStateを保存する。
    this._storageKeeper$
      .debounceTime(250)
      .subscribe(states => {
        // try { // LevelDBにデータを保存する。
        //   const headers = new Headers({ 'Content-Type': 'application/json' });
        //   const body = JSON.stringify(states);
        //   console.time('levelDbSetItem');
        //   this.http.post('/leveldb', body, { headers })
        //     .map(res => res.json() as string)
        //     .do(message => console.log(message))
        //     .subscribe(() => console.timeEnd('levelDbSetItem'));
        // } catch (err) {
        //   console.log(err);
        // }
        try { // IndexedDB(level-js)にデータを保存する。
          console.time('IndexedDB(level-js)SetItem');
          const ops = [
            { type: 'del', key: this.leveldbStatesKey },
            { type: 'put', key: this.leveldbStatesKey, value: JSON.stringify(states) }
          ];
          const db = levelup(LEVELDB_NAME, { db: leveljs });
          db.batch(ops, err => {
            if (err) { console.log(err); }
            console.timeEnd('IndexedDB(level-js)SetItem');
          });
        } catch (err) {
          console.log(err);
        }
      });
  }


  // サスペンドモードに入る
  suspend() {
    this.isSuspending = true;
  }

  // サスペンドモードから戻る
  revertSuspend() {
    if (this.isSuspending) {
      this.tempStates.forEach(state => this.states.push(state));
      this.tempStates = [];
      this.isSuspending = false;
      this._dispatcher$.next(null);
    }
  }

  private createSnapShot() {
    if (this.isSuspending) {
      const states = lodash.cloneDeep(this.states); // Object.assign([], this.states); // lodash.cloneDeep(this.states);
      this.snapShots.push(states);
    }
  }

  rollback(keepSuspend?: boolean) {
    if (!this.isSuspending) {
      this.suspend();
    }
    if (this.isSuspending) {
      this.createSnapShot();

      // 末尾から探索して最初に見つかったrollback=trueな要素を削除する。
      for (let i = this.states.length - 1; i >= 0; i = (i - 1) | 0) {
        const state = this.states[i];
        const rollback = state.rule && state.rule.rollback ? true : false;
        if (rollback) {
          // console.log(this.states);
          this.states.splice(i, 1); // 指定した位置の要素を削除。spliceは扱いが特殊な関数なので注意すること。
          // console.log(this.states);
          break;
        }
      }
      // this.states = this.states.slice(0, _times * -1); // 配列の末尾を削除
      console.log(this.snapShots);
    }
    if (!keepSuspend) {
      this.revertSuspend();
    }
  }

  // Rollbackを取り消す。
  // snapShotsの最後の要素をthis.statesに戻してsnapShotsの最後の要素を削除する。
  revertRollback(keepSuspend?: boolean) {
    if (!this.isSuspending) {
      this.suspend();
    }
    if (this.isSuspending && this.snapShots.length > 0) {
      const states = this.snapShots[this.snapShots.length - 1]; // 配列の末尾を取得
      this.states = states;
      this.snapShots = this.snapShots.slice(0, -1); // 配列の末尾を削除
      console.log(this.snapShots);
    } else {
      alert('No more Snapshots.\nSnapshot will be taken when UNDO is executed, and lost when new State is pushed to Store.\n');
    }
    if (!keepSuspend) {
      this.revertSuspend();
    }
  }


  // (Componentで)戻り値を.log()するとセットされたStateをコンソールに出力できる。
  // Suspendモードの間はdispatcherに値を送らないように制御している。
  put(data: any, nameablesAsIdentifier: Nameable[], ruleOptions?: StateRuleOptions): Promise<Logger> {
    console.time('put(setState)');
    if (!this.isReady) { return Promise.resolve(new Logger('Error: States on Store are not loaded yet.')); }
    return new Promise<Logger>(resolve => {
      const db = levelup(LEVELDB_NAME, { db: leveljs });
      db.get(this.leveldbOsnKey, (err, value) => {
        if (err) { console.log(err); }
        this.osnLatest = lodash.max([this.osnLatest, Number(value), 0]); // 最新(最大)のosnを取得する。
        if (nameablesAsIdentifier !== _NOTIFICATION_) { // NOTIFICATIONの場合はosnをカウントアップしない。Refreshを抑制するため。
          this.osnLatest++;
          db.put(this.leveldbOsnKey, this.osnLatest, (err) => {
            if (err) { console.log(err); }
          });
        }
        // console.log('osnLatest: ' + this.osnLatest);
        const identifier = generateIdentifier(nameablesAsIdentifier);
        const state = new State({ key: identifier, value: lodash.cloneDeep(data), osn: this.osnLatest, ruleOptions: ruleOptions });

        if (!this.isSuspending) {
          this._dispatcher$.next(state); // dispatcherをsubscribeしている全てのSubscriberをキックする。
        } else { // サスペンドモードのとき。
          this.tempStates.push(state);
        }
        resolve(new Logger(state, this.storeKey));
        console.timeEnd('put(setState)');
      });
    });

  }
  setState = this.put;

  refresh(): Promise<Logger> {
    // console.time('refresh');
    // return new Promise((resolve, reject) => {
    //   try { // IndexedDB(level-js)からデータを取得する。        
    //     const db = levelup(LEVELDB_NAME, { db: leveljs });
    //     db.get(this.leveldbStatesKey, (err, value) => {
    //       if (err) { console.log(err); }
    //       const states: State[] = value ? JSON.parse(value) : this.states;
    //       this.states = states;

    //       this.put('refreshed', _NOTIFICATION_, { limit: 1, duration: 1000 }).then(x => x.log('Store is now refreshed!')); // refreshしたらクライアントにPush通知する。
    //       resolve(new Logger('refresh', this.storeKey));
    //       console.timeEnd('refresh');
    //     });
    //   } catch (err) {
    //     console.log(err);
    //     reject(err);
    //   }
    // });
    const db = levelup(LEVELDB_NAME, { db: leveljs });
    return new Promise<Logger>((resolve, reject) => {
      db.get(this.leveldbOsnKey, (err, value) => {
        if (err) { console.log(err); }
        const osnFromDb = Number(value);
        if (this.osnLatest !== osnFromDb) {
          if (this.autoRefresh) {
            console.time('refresh');
            try { // IndexedDB(level-js)からデータを取得する。        
              const db = levelup(LEVELDB_NAME, { db: leveljs });
              db.get(this.leveldbStatesKey, (err, value) => {
                if (err) { console.log(err); }
                const states: State[] = value ? JSON.parse(value) : this.states;
                this.states = states;

                this.put('refreshed', _NOTIFICATION_, { limit: 1, duration: 1000 }).then(x => x.log('Store is now refreshed!')); // refreshしたらクライアントにPush通知する。
                resolve(new Logger('refresh', this.storeKey));
                console.timeEnd('refresh');
              });
            } catch (err) {
              console.log(err);
              reject(new Logger(err, this.storeKey));
            }
          } else {
            alert('(CAUTION) The states on this window are not latest! (storeKey: ' + this.storeKey + ')');
            resolve(new Logger('alert', this.storeKey));
          }
        } else {
          console.log('Refresh was skipped because the states on this window are latest. (storeKey: ' + this.storeKey + ')');
          resolve(new Logger('latest', this.storeKey));
        }
      });
    });
  }

  takeMany<T>(nameablesAsIdentifier: Nameable[], limit: number = DEFAULT_LIMIT): T[] {
    const identifier = generateIdentifier(nameablesAsIdentifier);
    const _limit = limit && limit > 0 ? limit : DEFAULT_LIMIT;
    const values = this.states
      .filter(state => state && state.key === identifier)
      .map(state => pluckValueFromState<T>(state));
    let results: T[];
    if (values.length > 0) {
      results = values.slice(values.length - _limit); // 配列の先頭側から要素を削除する。
    } else {
      results = [];
    }
    return lodash.cloneDeep(results).reverse(); // cloneDeepして返さないとComponentでの変更がStore内に波及する。昇順を降順に反転させる。
  }
  getStates = this.takeMany;

  takeLatest<T>(nameablesAsIdentifier: Nameable[], alternative?: any): T {
    const values = this.takeMany<T>(nameablesAsIdentifier, 1);
    const _alt: T = lodash.isUndefined(alternative) ? null : alternative;
    const value = values && values.length > 0 ? values[0] : _alt;
    return value;
  }
  getState = this.takeLatest;

  private takeManyAsState$(nameablesAsIdentifier: Nameable[], limit: number = DEFAULT_LIMIT): Observable<State[]> {
    const identifier = generateIdentifier(nameablesAsIdentifier);
    const _limit = limit && limit > 0 ? limit : DEFAULT_LIMIT;
    return this._returner$
      .map(states => states.filter(obj => obj && obj.key === identifier))
      .map(states => states.slice(states.length - _limit)) // 配列の先頭側から要素を削除する。
      .map(states => lodash.cloneDeep(states).reverse()); // cloneDeepして返さないとComponentでの変更がStore内に波及する。昇順を降順に反転させる。
  }

  takeMany$<T>(nameablesAsIdentifier: Nameable[], limit: number = DEFAULT_LIMIT): Observable<T[]> {
    const identifier = generateIdentifier(nameablesAsIdentifier);
    const _limit = limit && limit > 0 ? limit : DEFAULT_LIMIT;
    return this._returner$
      .map(states => states.filter(obj => obj && obj.key === identifier))
      .map(states => states.map(obj => pluckValueFromState<T>(obj)))
      .map(values => values.slice(values.length - _limit)) // 配列の先頭側から要素を削除する。
      .map(values => lodash.cloneDeep(values).reverse()); // cloneDeepして返さないとComponentでの変更がStore内に波及する。昇順を降順に反転させる。
  }
  getStates$ = this.takeMany$;

  takeLatest$<T>(nameablesAsIdentifier: Nameable[], alternative?: any): Observable<T> {
    const _alt: T = lodash.isUndefined(alternative) ? null : alternative;
    return this.takeMany$<T>(nameablesAsIdentifier, 1)
      .map(values => values.length > 0 ? values[0] : _alt);
  }
  getState$ = this.takeLatest$;

  // ただの配列を時間軸のある値のストリームに変換して流す。後続はinterval毎に配列の値を順々に受け取る。
  // states: [a,b,c,d,e] (this.states)
  // input: [e,c,a]
  // output: |--a--c--e-->
  // output: |--e--c--a--> (if descending is true)
  takePresetReplayStream$<T>(nameablesAsIdentifier: Nameable[], options?: ReplayStreamOptions): Observable<T> {
    const {limit, interval, descending, truetime } = options;
    const _interval = interval && interval > 0 ? interval : DEFAULT_INTERVAL;
    let previousTime: number;
    return this.takeManyAsState$(nameablesAsIdentifier, limit)
      .map(states => states.length > 0 ? states : [new State()]) // objsが空配列だとsubscribeまでストリームが流れないのでnull配列を作る。
      .map(states => descending ? states : states.reverse())
      .do(states => previousTime = states[0].timestamp) // previousTimeをセットする。
      .switchMap(states => { // switchMapは次のストリームが流れてくると"今流れているストリームをキャンセルして"新しいストリームを流す。
        if (truetime) { // truetimeがtrueなら実時間を再現したリプレイストリームを作る。
          return Observable.timer(1, 1)
            .takeWhile(x => x < states.length)
            .delayWhen(x => Observable.interval(states[x] ? Math.abs(states[x].timestamp - previousTime) : _interval))
            .do(x => previousTime = states[x].timestamp) // previousTimeを更新する。
            .map(x => states[x]);
        } else {
          return Observable.timer(1, _interval)
            .takeWhile(x => x < states.length)
            .map(x => states[x]);
        }
      })
      .map(states => pluckValueFromState<T>(states));
  }
  getPresetReplayStream$ = this.takePresetReplayStream$;

  // ただの配列を時間軸のある配列のストリームに変換して流す。後続はinterval毎に要素が順々に増えていく配列を受け取る。
  // states: [a,b,c,d,e] (this.states)
  // input: [e,c,a]
  // output: |--[a]--[a,c]--[a,c,e]-->
  // output: |--[e]--[e,c]--[e,c,a]--> (if descending is true)
  takePresetReplayArrayStream$<T>(nameablesAsIdentifier: Nameable[], options?: ReplayStreamOptions): Observable<T[]> {
    const {limit, interval, descending, truetime } = options;
    const _interval = interval && interval > 0 ? interval : DEFAULT_INTERVAL;
    let results: State[];
    let previousTime: number;
    return this.takeManyAsState$(nameablesAsIdentifier, limit)
      .map(states => states.length > 0 ? states : [new State()]) // objsが空配列だとsubscribeまでストリームが流れないのでnull配列を作る。
      .map(states => descending ? states : states.reverse())
      .do(states => previousTime = states[0].timestamp) // previousTimeをセットする。
      .do(() => results = [])
      .switchMap(states => { // switchMapは次のストリームが流れてくると"今流れているストリームをキャンセルして"新しいストリームを流す。        
        if (truetime) { // truetimeがtrueなら実時間を再現したリプレイストリームを作る。
          return Observable.timer(1, 1)
            .takeWhile(x => x < states.length)
            .delayWhen(x => Observable.interval(states[x] ? Math.abs(states[x].timestamp - previousTime) : _interval))
            .do(x => previousTime = states[x].timestamp) // previousTimeを更新する。
            .map(x => {
              results.push(states[x]);
              return results;
            });
        } else {
          return Observable.timer(1, _interval)
            .takeWhile(x => x < states.length)
            .map(x => {
              results.push(states[x]);
              return results;
            });
        }
      })
      .map(states => states.map(obj => pluckValueFromState<T>(obj)));
  }
  getPresetReplayArrayStream$ = this.takePresetReplayArrayStream$;

  setDisposableSubscription(subscription: Subscription, nameablesAsIdentifier: Nameable[]): void {
    const identifier = generateIdentifier(nameablesAsIdentifier);
    const obj = new DisposableSubscription({ key: identifier, value: subscription });
    this.subscriptions.push(obj);
  }

  disposeSubscriptions(nameablesAsIdentifier: Nameable[] = [this]): void {
    const identifier = generateIdentifier(nameablesAsIdentifier);
    this.subscriptions
      .filter(obj => obj && obj.key === identifier)
      .map(obj => obj.value)
      .forEach(subscription => {
        subscription.unsubscribe();
      });
    const aliveSubscriptions = this.subscriptions
      .filter(obj => obj && !!obj.key)
      .filter(obj => {
        const subscription = obj.value;
        return subscription && !subscription.isUnsubscribed ? true : false;
      });
    this.subscriptions = null;
    this.subscriptions = aliveSubscriptions;
    // console.log('↓ subscriptions array on Store ↓');
    // console.log(this.subscriptions);
  }

  clearStatesAndStorage(): void {
    // try {
    //   window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    // } catch (err) {
    //   console.error(err);
    // }
    this.states = null; // メモリ解放。
    this.states = []; // this.statesがnullだと各地でエラーが頻発するので空の配列をセットする。
    this._dispatcher$.next(null);
  }
}


////////////////////////////////////////////////////////////////////////////
// Helper Functions
function gabageCollector(states: State[]): State[] {
  console.time('gabageCollector');
  const keys = states.filter(obj => obj && !!obj.key).map(obj => obj.key);
  const uniqKeys = lodash.uniq(keys);
  // console.log('Keys: ' + uniqKeys.join(', '));
  let newObjs: State[] = [];

  // key毎に保存最大数を超えたものをカットして新しい配列を作る。
  uniqKeys.forEach(identifier => {
    const objs = states.filter(obj => obj && obj.key === identifier);
    const lastObj = objs[objs.length - 1]; // 配列の末尾を取得
    const limit = lastObj.rule && lastObj.rule.limit ? lastObj.rule.limit : DEFAULT_LIMIT;
    if (objs.length > limit) {
      objs.reverse().slice(0, limit).reverse().forEach(obj => newObjs.push(obj));
    } else {
      objs.forEach(obj => newObjs.push(obj));
    }
  });
  newObjs = newObjs.sort((a, b) => a.osn > b.osn ? 1 : -1); // ObjectSequenceNumberの昇順で並べ替える。
  console.timeEnd('gabageCollector');
  return newObjs;
}

// gabageCollectorの処理速度が高速になるようにチューニングしたもの。10倍近く速い。
// 参考: http://qiita.com/keroxp/items/67804391a8d65eb32cb8
function gabageCollectorFastTuned(states: State[]): State[] {
  if (states.length === 0) { return states; }
  console.time('gabageCollectorFastTuned');
  // const keys = stateObjects.filter(obj => obj && typeof obj === 'object').map(obj => Object.keys(obj)[0]);
  let keys: string[] = [];
  // let i = 0;
  for (let i = 0; i < states.length; i = (i + 1) | 0) {
    const state = states[i];
    if (state && !!state.key) { // この段階でstate.keyがnullのものは除外される。
      keys.push(state.key);
    }
    // i = (i + 1) | 0;
  }
  const uniqKeys = lodash.uniq(keys);
  // console.log('Keys: ' + uniqKeys.join(', '));
  let newObjs: State[] = [];

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
    let objs: State[] = [];
    // let k = 0;
    for (let k = 0; k < states.length; k = (k + 1) | 0) {
      const state = states[k];
      if (state && state.key === identifier) {
        objs.push(state);
      }
      // k = (k + 1) | 0;
    }

    // StateRuleが保持されている場合、最大保存数を差し替える。
    const stateLast = objs[objs.length - 1]; // 配列の末尾を取得
    const limit = stateLast.rule && stateLast.rule.limit ? stateLast.rule.limit : DEFAULT_LIMIT;
    const filterId = stateLast.rule && stateLast.rule.filterId ? stateLast.rule.filterId : null;

    // uniqueIdが指定されている場合、同じuniqueIdのものだけ抽出する。
    if (filterId) {
      objs = objs.filter(obj => obj.rule && obj.rule.filterId ? obj.rule.filterId === filterId : true);
    }

    // durationが指定されている場合、durationを過ぎていないものだけ抽出する。
    const now = lodash.now();
    objs = objs.filter(obj => obj.rule && obj.rule.duration ? now - obj.timestamp < obj.rule.duration : true);

    if (objs.length > limit) {
      // objs.reverse().slice(0, maxElementsByKey).reverse().forEach(obj => newObjs.push(obj));
      // const ary = objs.reverse().slice(0, _limit).reverse(); // TODO:もっとやりようがある。
      const ary = objs.slice(0, limit * -1);
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
  newObjs = newObjs.sort((a, b) => a.osn > b.osn ? 1 : -1); // ObjectSequenceNumberの昇順で並べ替える。
  console.timeEnd('gabageCollectorFastTuned');
  return newObjs;
}

function generateIdentifier(nameables: Nameable[]): string {
  let ary: string[] = [];

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

function pluckValueFromState<T>(obj: State | Object): T {
  // try {
  //   const key = Object.keys(obj).filter(key => key.startsWith(IDENTIFIER_PREFIX))[0];
  //   return obj[key] as T;
  // } catch (err) {
  //   return obj as T;
  // }
  if (obj && obj instanceof State) {
    return obj.value as T;
  } else if (obj && 'value' in obj) { // LocalStorageからStatesを復旧した場合はこちらを通る。
    return obj['value'] as T;
  } else {
    return obj as T;
  }
}


////////////////////////////////////////////////////////////////////////////
// State Class
class State {
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
class StateRule {
  limit: number;
  rollback: boolean;
  filterId: string | number;
  duration: number;
  constructor(options: StateRuleOptions) {
    const {limit, rollback, filterId, duration} = options;
    this.limit = limit && limit > 0 ? limit : DEFAULT_LIMIT;
    this.rollback = rollback ? true : false;
    this.filterId = filterId ? filterId : null;
    this.duration = duration ? duration : null;
  }
}
interface StateRuleOptions {
  limit?: number;
  rollback?: boolean;
  filterId?: string | number;
  duration?: number;
}

////////////////////////////////////////////////////////////////////////////
// Logger Class
class Logger {
  constructor(private state: State | string, private storeKey: string = '') { }

  log(message?: string): any {
    const _storeKey = this.storeKey ? '(storeKey: ' + this.storeKey + ')' : '';
    if (message) {
      console.log('===== Added State ' + _storeKey + ': ' + message + ' =====');
    } else {
      console.log('===== Added State ' + _storeKey + ' =====');
    }
    const obj = Object.keys(this).reduce((p, key) => { // インスタンス変数が畳み込みの対象となる。
      p[key] = this[key];
      return p;
    }, {});
    console.log(obj);
    return this;
  }
}

////////////////////////////////////////////////////////////////////////////
// DisposableSubscription Class
class DisposableSubscription {
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
interface ReplayStreamOptions {
  interval?: number;
  limit?: number;
  descending?: boolean;
  truetime?: boolean;
}