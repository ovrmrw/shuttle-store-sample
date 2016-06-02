import lodash from 'lodash';

import { Store, DEFAULT_LIMIT } from './store';
import { State, Nameable } from './store.types';

////////////////////////////////////////////////////////////////////////////
// Helper Functions
export function gabageCollector(states: State[]): State[] {
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
export function gabageCollectorFastTuned(states: State[]): State[] {
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

export function generateIdentifier(nameables: Nameable[]): string {
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

export function pluckValueFromState<T>(obj: State | Object): T {
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

export function informMix(message: string, store: Store, toastrFn?: Function, altFn?: Function): string {
  const _message = message + ' (storeKey: ' + store.key + ')';
  if (store.devMode) {
    if (store.useToastr && toastrFn) {
      toastrFn.call(null, _message);
    } else if (altFn) {
      altFn.call(null, _message);
    } else {
      console.log(_message);
    }
  }
  return _message;
}
