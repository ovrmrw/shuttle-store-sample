import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, Subscription } from 'rxjs/Rx';
import lodash from 'lodash';
import levelup from 'levelup';
const leveljs = require('level-js');
import toastr from 'toastr';

import { State, StateRule, StateRuleOptions,
  DisposableSubscription, SnapShot, NameablesOrIdentifier,
  ReplayStreamOptions, Logger } from './store.type';
import { generateIdentifier, gabageCollectorFastTuned, pluckValueFromState,
  getPositiveNumber, logConstructorName, convertJsonValueToStates,
  compareIdentifiers } from './store.helper';

// const LOCAL_STORAGE_KEY = 'ovrmrw-localstorage-store';
const LEVELDB_NAME = 'ovrmrw-shuttle-store';
const LEVELDB_KEY = 'states';
export const DEFAULT_LIMIT = 1000;
export const DEFAULT_INTERVAL = 10;
export const _NOTIFICATION_ = ['push-notification-from-store-to-client'];


@Injectable()
export class Store {
  private states: State[] = [];
  private osnLatest: number = null; // ObjectSequenceNumber
  private subscriptions: DisposableSubscription[] = [];
  private snapShots: SnapShot[] = [];
  private dispatcher$: Subject<any> = new Subject<any>();
  private storageKeeper$: Subject<State[]> = new Subject<State[]>();
  private returner$: BehaviorSubject<State[]>;
  private isReady: boolean = false;

  private storeKey: string;
  get key() { return this.storeKey; }

  private dbStatesKey: string;
  get levelupStatesKey() { return this.dbStatesKey; }
  private dbOsnKey: string;
  get levelupOsnKey() { return this.dbOsnKey; }
  getLevelupInstance() { return levelup(LEVELDB_NAME, { db: leveljs }); }

  // サスペンドで使う変数群。
  private isSuspending: boolean = false;
  private tempStates: State[] = [];

  private enableAutoRefresh: boolean = false;
  get autoRefresh() { return this.enableAutoRefresh; }
  private enableDevMode: boolean = false;
  get devMode() { return this.enableDevMode; }
  private enableToastr: boolean = false;
  get useToastr() { return this.enableToastr; }


  // クラス名だけでDIすると全ての引数はundefinedで入ってくるので、その場合の処理も書いておく必要がある。
  constructor(storeKey: string, options?: {
    autoRefresh?: boolean;
    devMode?: boolean;
    useToastr?: boolean;
  }) {
    logConstructorName.call(this);
    const {autoRefresh, devMode, useToastr} = options || { autoRefresh: false, devMode: false, useToastr: false };
    this.storeKey = storeKey || '__main__';
    this.dbStatesKey = LEVELDB_KEY + '-' + this.storeKey;
    this.dbOsnKey = this.dbStatesKey + '-osn';

    this.enableAutoRefresh = autoRefresh ? true : false;
    this.enableDevMode = devMode ? true : false;
    this.enableToastr = useToastr ? true : false;


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
      const db = this.getLevelupInstance(); // levelup(LEVELDB_NAME, { db: leveljs });
      db.get(this.levelupStatesKey, (err, value) => {
        if (err && !lodash.isEmpty(err)) { console.error(err); }
        // const json = value; // rename
        // this.states = json && typeof (json) === 'string' ? JSON.parse(json) : this.states;
        this.states = convertJsonValueToStates(value, this.states);

        const message = this.informMix('Store is now on ready!', toastr.success);
        this.isReady = true;
        this.putNewNotification('ready', message); // this.put('ready', _NOTIFICATION_, { limit: 1 }).then(x => x.log(message)); // statesをロードしたらクライアントにPush通知する。
        console.timeEnd('IndexedDB(level-js)GetItem');
      });
    } catch (err) {
      console.log(err);
    }


    // ComponentはこのSubjectのストリームを受けることでViewを動的に更新する。
    this.returner$ = new BehaviorSubject(this.states);


    // 主にput関数から呼ばれ、新しいStateをStoreに追加しつつComponentにPush通知する。
    this.dispatcher$
      .subscribe(newState => {
        if (newState instanceof State) { // nullがthis.statesにpushされないように制御する。
          this.states.push(newState);
          this.snapShots = []; // this.statesに新しい値がpushされたらsnapshotsは初期化する。
        }
        this.states = gabageCollectorFastTuned(this.states);
        // console.log('↓ states array on Store ↓');
        // console.log(this.states);
        this.returner$.next(this.states);
        this.storageKeeper$.next(this.states);
      });


    // debounceTimeで頻度を抑えながらStorageにStateを保存する。
    this.storageKeeper$
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
          const db = this.getLevelupInstance(); // levelup(LEVELDB_NAME, { db: leveljs });
          const ops = [
            { type: 'del', key: this.levelupStatesKey },
            { type: 'put', key: this.levelupStatesKey, value: JSON.stringify(states) }
          ];
          db.batch(ops, (err) => {
            if (err && !lodash.isEmpty(err)) { console.error(err); }
            console.timeEnd('IndexedDB(level-js)SetItem');

            // タブウインドウがアクティブな場合のみ、localStorageを変更してwindowの"storage"イベントを発火させる。
            if (document.hasFocus()) { // hasFocusを書かないと複数タブ間で無限ループが始まる。
              setTimeout(() => {
                console.time('LocalStorageChange');
                window.localStorage.setItem(this.storeKey, String(lodash.now()));
                console.timeEnd('LocalStorageChange');
              }, 1);
            }
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


  // サスペンドモードから戻る。osnをインクリメントしてから戻ることで状態が変更したことを知らせる。
  revertSuspend() {
    if (this.isSuspending) {
      this.osnLatest++; // osnをインクリメントしてサスペンドを抜ける。
      const db = this.getLevelupInstance();
      db.put(this.levelupOsnKey, this.osnLatest, (err) => {
        if (err) { console.log(err); }

        this.tempStates.forEach(state => this.states.push(state));
        this.tempStates = [];
        this.isSuspending = false;
        this.dispatcher$.next(null);
      });
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
      this.informMix('Undo (rollback)', toastr.info);
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
      this.informMix('Redo (revert rollback)', toastr.info);
    } else {
      this.informMix('No more Snapshots.\nSnapshot will be taken when UNDO is executed, and lost when new State is pushed to Store.\n', toastr.warning, alert);
    }
    if (!keepSuspend) {
      this.revertSuspend();
    }
  }


  // for unit test. This function returns a Store instance whose DB is ready.
  readyForTest(clearStates: boolean = true): Promise<Store> {
    return new Promise(resolve => {
      const timer = setInterval(() => {
        if (this.isReady) {
          clearInterval(timer);
          if (clearStates) {
            this.clearStatesAndStorage();
          }
          resolve(this);
        }
      }, 10);
    });
  }


  // (Componentで)戻り値を.log()するとセットされたStateをコンソールに出力できる。
  // Suspendモードの間はdispatcherに値を送らないように制御している。
  put(data: any, nameablesOrIdentifier: NameablesOrIdentifier, ruleOptions?: StateRuleOptions): Promise<Logger> {
    if (!this.isReady) { return Promise.resolve(new Logger('Error: States on Store are not loaded yet.', this)); }
    console.time('put(setState)');
    return new Promise<Logger>(resolve => {
      const db = this.getLevelupInstance(); // levelup(LEVELDB_NAME, { db: leveljs });
      db.get(this.levelupOsnKey, (err, value) => {
        if (err && !lodash.isEmpty(err)) { console.error(err); }
        const osn = Number(value); // rename/retype
        this.osnLatest = lodash.max([this.osnLatest, osn, 0]); // 最新(最大)のosnを取得する。

        const identifier = generateIdentifier(nameablesOrIdentifier);

        // 直近のStateを取得し、lockされているか確認する。
        const stateLatest: State = this.takeLatestAsState(identifier) || new State();
        const isLocked: boolean = stateLatest.rule && stateLatest.rule.lock ? stateLatest.rule.lock : null;

        if (!isLocked) { // Stateに既にlockルールが適用されている場合は追加しない。          
          // NOTIFICATIONの場合はosnをカウントアップしない。Refreshを抑制するため。  
          if (!compareIdentifiers(identifier, _NOTIFICATION_)) { this.osnLatest++; }
          // osnをLevelDBにWriteする。
          db.put(this.levelupOsnKey, this.osnLatest, (err) => {
            if (err && !lodash.isEmpty(err)) { console.error(err); }
            // this.informMix('osnLatest: ' + this.osnLatest);
          });

          const newState = new State({ key: identifier, value: lodash.cloneDeep(data), osn: this.osnLatest, ruleOptions: ruleOptions });
          if (newState.rule && newState.rule.lock) { // lockされたことを通知する。
            this.informMix(`State(${identifier}) is locked.`, toastr.info, alert);
          }
          if (newState.rule && newState.rule.duration) { // durationが経過した後にNotificationを送る。
            setTimeout(() => this.putNewNotification('timer', 'Timer invoked by duration time'), newState.rule.duration);
          }

          console.timeEnd('put(setState)');
          if (!this.isSuspending) {
            // setTimeout(() => { // 必要無ければ余計な遅延は発生させないこと。
            this.dispatcher$.next(newState); // dispatcherをsubscribeしている全てのSubscriberをキックする。
            // }, 1);
          } else { // サスペンドモードのとき。
            this.tempStates.push(newState);
          }
          resolve(new Logger(newState, this));
          // console.timeEnd('put(setState)');
        } else {
          console.timeEnd('put(setState)');
          const message = this.informMix(`State(${identifier}) is already locked!`, toastr.error, alert);
          resolve(new Logger(message, this));
        }
      });
    });
  }
  setState = this.put;


  takeMany<T>(nameablesOrIdentifier: NameablesOrIdentifier, limit: number = DEFAULT_LIMIT): T[] {
    const identifier = generateIdentifier(nameablesOrIdentifier);
    const _limit = getPositiveNumber(limit, DEFAULT_LIMIT); // limit && limit > 0 ? limit : DEFAULT_LIMIT;
    const values = this.states
      .filter(state => state && state.key === identifier)
      .map(state => pluckValueFromState<T>(state));
    // let results: T[];
    // if (values.length > 0) {
    //   results = values.slice(values.length - _limit); // 配列の先頭側から要素を削除する。
    // } else {
    //   results = [];
    // }
    const valuesSliced = values.length > 0 ? values.slice(values.length - _limit) /* 配列の先頭側から要素を削除する */ : values;
    return lodash.cloneDeep(valuesSliced).reverse(); // cloneDeepして返さないとComponentでの変更がStore内に波及する。昇順を降順に反転させる。
  }
  getStates = this.takeMany;


  takeLatest<T>(nameablesOrIdentifier: NameablesOrIdentifier, alternative?: any): T {
    const values = this.takeMany<T>(nameablesOrIdentifier, 1);
    const _alt: T = lodash.isUndefined(alternative) ? null : alternative;
    const value = values && values.length > 0 ? values[0] : _alt;
    return value;
  }
  getState = this.takeLatest;


  private takeManyAsState(nameablesOrIdentifier: NameablesOrIdentifier, limit: number = DEFAULT_LIMIT): State[] {
    const identifier = generateIdentifier(nameablesOrIdentifier);
    const _limit = getPositiveNumber(limit, DEFAULT_LIMIT); // limit && limit > 0 ? limit : DEFAULT_LIMIT;
    const states = this.states
      .filter(state => state && state.key === identifier);
    const statesSliced = states.length > 0 ? states.slice(states.length - _limit) /* 配列の先頭側から要素を削除する */ : states;
    return lodash.cloneDeep(statesSliced).reverse(); // cloneDeepして返さないとComponentでの変更がStore内に波及する。昇順を降順に反転させる。
  }


  private takeLatestAsState(nameablesOrIdentifier: NameablesOrIdentifier): State {
    const states = this.takeManyAsState(nameablesOrIdentifier, 1);
    return states && states.length > 0 ? states[0] : null;
  }


  takeMany$<T>(nameablesOrIdentifier: NameablesOrIdentifier, limit: number = DEFAULT_LIMIT): Observable<T[]> {
    const identifier = generateIdentifier(nameablesOrIdentifier);
    const _limit = getPositiveNumber(limit, DEFAULT_LIMIT); // limit && limit > 0 ? limit : DEFAULT_LIMIT;
    return this.returner$
      .map(states => states.filter(obj => obj && obj.key === identifier))
      .map(states => states.map(obj => pluckValueFromState<T>(obj)))
      .map(values => values.slice(values.length - _limit)) // 配列の先頭側から要素を削除する。
      .map(values => lodash.cloneDeep(values).reverse()); // cloneDeepして返さないとComponentでの変更がStore内に波及する。昇順を降順に反転させる。
  }
  getStates$ = this.takeMany$;


  takeLatest$<T>(nameablesOrIdentifier: NameablesOrIdentifier, alternative?: any): Observable<T> {
    const _alt: T = lodash.isUndefined(alternative) ? null : alternative;
    return this.takeMany$<T>(nameablesOrIdentifier, 1)
      .map(values => values.length > 0 ? values[0] : _alt);
  }
  getState$ = this.takeLatest$;


  private takeManyAsState$(nameablesOrIdentifier: NameablesOrIdentifier, limit: number = DEFAULT_LIMIT): Observable<State[]> {
    const identifier = generateIdentifier(nameablesOrIdentifier);
    const _limit = getPositiveNumber(limit, DEFAULT_LIMIT); // limit && limit > 0 ? limit : DEFAULT_LIMIT;
    return this.returner$
      .map(states => states.filter(obj => obj && obj.key === identifier))
      .map(states => states.slice(states.length - _limit)) // 配列の先頭側から要素を削除する。
      .map(states => lodash.cloneDeep(states).reverse()); // cloneDeepして返さないとComponentでの変更がStore内に波及する。昇順を降順に反転させる。
  }


  private takeLatestAsState$(nameablesOrIdentifier: NameablesOrIdentifier): Observable<State> {
    return this.takeManyAsState$(nameablesOrIdentifier, 1)
      .map(states => states.length > 0 ? states[0] : null);
  }


  unlockState(nameablesOrIdentifier: NameablesOrIdentifier): Promise<Logger> {
    const identifier = generateIdentifier(nameablesOrIdentifier);
    this.states
      .filter(state => state && state.key === identifier)
      .filter(state => state.rule && state.rule.lock)
      .forEach(state => state.rule.lock = false);
    const message = this.informMix(`State(${identifier}) is now unlocked.`, toastr.info, alert);
    return Promise.resolve(new Logger(message, this));
  }


  // ただの配列を時間軸のある値のストリームに変換して流す。後続はinterval毎に配列の値を順々に受け取る。
  // states: [a,b,c,d,e] (this.states)
  // input: [e,c,a]
  // output: |--a--c--e-->
  // output: |--e--c--a--> (if descending is true)
  takePresetReplayStream$<T>(nameablesOrIdentifier: NameablesOrIdentifier, options?: ReplayStreamOptions): Observable<T> {
    const {limit, interval, descending, truetime } = options;
    const _interval = getPositiveNumber(interval, DEFAULT_INTERVAL); // interval && interval > 0 ? interval : DEFAULT_INTERVAL;
    let previousTime: number;
    return this.takeManyAsState$(nameablesOrIdentifier, limit)
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
      .map(state => pluckValueFromState<T>(state))
      .filter(value => value !== null);
  }
  getPresetReplayStream$ = this.takePresetReplayStream$;


  // ただの配列を時間軸のある配列のストリームに変換して流す。後続はinterval毎に要素が順々に増えていく配列を受け取る。
  // states: [a,b,c,d,e] (this.states)
  // input: [e,c,a]
  // output: |--[a]--[a,c]--[a,c,e]-->
  // output: |--[e]--[e,c]--[e,c,a]--> (if descending is true)
  takePresetReplayArrayStream$<T>(nameablesOrIdentifier: NameablesOrIdentifier, options?: ReplayStreamOptions): Observable<T[]> {
    const {limit, interval, descending, truetime } = options;
    const _interval = getPositiveNumber(interval, DEFAULT_INTERVAL); // interval && interval > 0 ? interval : DEFAULT_INTERVAL;
    let ary: State[];
    let previousTime: number;
    return this.takeManyAsState$(nameablesOrIdentifier, limit)
      .map(states => states.length > 0 ? states : [new State()]) // objsが空配列だとsubscribeまでストリームが流れないのでnull配列を作る。
      .map(states => descending ? states : states.reverse())
      .do(states => previousTime = states[0].timestamp) // previousTimeをセットする。
      .do(() => ary = [])
      .switchMap(states => { // switchMapは次のストリームが流れてくると"今流れているストリームをキャンセルして"新しいストリームを流す。        
        if (truetime) { // truetimeがtrueなら実時間を再現したリプレイストリームを作る。
          return Observable.timer(1, 1)
            .takeWhile(x => x < states.length)
            .delayWhen(x => Observable.interval(states[x] ? Math.abs(states[x].timestamp - previousTime) : _interval))
            .do(x => previousTime = states[x].timestamp) // previousTimeを更新する。
            .map(x => {
              ary.push(states[x]);
              return ary;
            });
        } else {
          return Observable.timer(1, _interval)
            .takeWhile(x => x < states.length)
            .map(x => {
              ary.push(states[x]);
              return ary;
            });
        }
      })
      .map(states => states.map(obj => pluckValueFromState<T>(obj)))
      .map(values => values.filter(value => value !== null));
  }
  getPresetReplayArrayStream$ = this.takePresetReplayArrayStream$;


  setDisposableSubscription(subscription: Subscription, nameablesOrIdentifier: NameablesOrIdentifier): void {
    const identifier = generateIdentifier(nameablesOrIdentifier);
    const obj = new DisposableSubscription({ key: identifier, value: subscription });
    this.subscriptions.push(obj);
  }


  disposeSubscriptions(nameablesOrIdentifier: NameablesOrIdentifier = [this]): void {
    const identifier = generateIdentifier(nameablesOrIdentifier);
    this.subscriptions
      .filter(obj => obj && obj.key === identifier)
      .map(obj => obj.value)
      .forEach(subscription => {
        subscription.unsubscribe();
      });
    const aliveSubscriptions = this.subscriptions
      .filter(obj => obj && !!obj.key) // これ何のチェック？
      .filter(obj => {
        const subscription = obj.value; // rename
        return subscription && !subscription.isUnsubscribed ? true : false;
      });
    this.subscriptions = null; // メモリ解放。
    this.subscriptions = aliveSubscriptions;
    // console.log('↓ subscriptions array on Store ↓');
    // console.log(this.subscriptions);
  }


  clearStatesAndStorage(): void {
    const db = this.getLevelupInstance();
    db.del(this.levelupStatesKey, (err) => {
      if (err) { console.error(err); }
    });
    db.del(this.levelupOsnKey, (err) => {
      if (err) { console.error(err); }
    });

    this.states = null; // メモリ解放。
    this.states = []; // this.statesがnullだと各地でエラーが頻発するので空の配列をセットする。
    this.dispatcher$.next(null);
    this.informMix('States and Storages are cleared.', toastr.success, console.log);
  }


  refresh(forceStoreKey?: string): Promise<Logger> {
    return new Promise<Logger>((resolve, reject) => {
      const db = this.getLevelupInstance(); // levelup(LEVELDB_NAME, { db: leveljs });
      db.get(this.levelupOsnKey, (err, value) => {
        if (err) { console.error(err); }
        const osn: number = value ? Number(value) : null; // rename/retype        
        if (this.osnLatest !== osn || forceStoreKey === this.storeKey) {
          // this.informMix(`osn diff detected: osn on memory -> ${this.osnLatest}, osn on DB -> ${osn}`);
          if (this.enableAutoRefresh) {
            console.time('refresh');
            try { // IndexedDB(level-js)からデータを取得する。        
              db.get(this.levelupStatesKey, (err, value) => {
                if (err) { console.error(err); }
                this.states = convertJsonValueToStates(value, this.states);

                const message = this.informMix('Store is now refreshed!', toastr.info);
                // console.log(message);
                this.putNewNotification('refreshed', message); // this.put('refreshed', _NOTIFICATION_, { limit: 1 }).then(x => x.log(message)); // refreshしたらクライアントにPush通知する。
                resolve(new Logger('refresh', this));
                console.timeEnd('refresh');
              });
            } catch (err) {
              console.log(err);
              reject(new Logger(err, this));
            }
          } else {
            this.informMix('(CAUTION) The states on this window are not latest!', toastr.warning, alert);
            resolve(new Logger('alert', this));
          }
        } else {
          this.informMix('Refresh was skipped because the states on this window are latest.');
          resolve(new Logger('latest', this));
        }
      });
    });
  }



  ////////////////////////////////////////////////////////////////////////////
  // Helper Functions
  // thisがStoreの場合のみ有効
  private informMix(message: string, toastrFn?: Function, altFn?: Function): string {
    const _message = message + ' (storeKey: ' + this.storeKey + ')';
    if (this.devMode) {
      if (this.useToastr && toastrFn) {
        toastrFn.call(null, _message);
      } else if (altFn) {
        altFn.call(null, _message);
      } else {
        console.log(_message);
      }
    }
    return _message;
  }

  private putNewNotification(value: any, message?: string) {
    this.put(value, _NOTIFICATION_, { limit: 10 }).then(x => message ? x.log(message) : undefined);
  }
}