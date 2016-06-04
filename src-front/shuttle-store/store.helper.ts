import lodash from 'lodash';

import { Store, DEFAULT_LIMIT, _NOTIFICATION_ } from './store';
import { State, NameablesOrIdentifier, Nameable } from './store.type';


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

    // uniqueIdルールが指定されている場合、同じuniqueIdのものだけ抽出する。
    if (filterId) {
      objs = objs.filter(obj => obj.rule && obj.rule.filterId ? obj.rule.filterId === filterId : true);
    }

    // durationルールが指定されている場合、durationを過ぎていないものだけ抽出する。
    const now = lodash.now();
    objs = objs.filter(obj => obj.rule && obj.rule.duration ? now - obj.timestamp < obj.rule.duration : true);

    // lockルールが指定されている場合、lock=true以降の要素は排除する。
    // put関数の中で制御する。
    // let isLocked = false;
    // objs = objs.reduce((p, obj) => {
    //   if (!isLocked) { p.push(obj); } // 必ず最初の要素はpushされるようにする。
    //   if (obj.rule && obj.rule.lock) { isLocked = true; }      
    //   return p;
    // }, []);


    if (objs.length > limit) {
      // objs.reverse().slice(0, maxElementsByKey).reverse().forEach(obj => newObjs.push(obj));
      
      // console.log(objs);
      const ary = objs.slice(objs.length - limit); // 先頭側から削除する。
      // console.log(ary);
      
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


export function generateIdentifier(nameablesOrString: NameablesOrIdentifier): string {
  let ary: string[] = [];

  if (typeof nameablesOrString === 'string') {
    const identifier: string = nameablesOrString; // rename
    return identifier;
  } else {
    const nameables: Nameable[] = nameablesOrString; // rename
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
}


export function compareIdentifiers(nameablesOrIdentifier1: NameablesOrIdentifier, nameablesOrIdentifier2: NameablesOrIdentifier): boolean {
  const identifier1 = generateIdentifier(nameablesOrIdentifier1);
  const identifier2 = generateIdentifier(nameablesOrIdentifier2);
  // console.log([identifier1, identifier2]);
  return identifier1 === identifier2 ? true : false;
}


export function pluckValueFromState<T>(obj: State | Object): T {
  if (obj && obj instanceof State) {
    return obj.value as T;
  } else if (obj && 'value' in obj) { // LocalStorageからStatesを復旧した場合はこちらを通る。
    return obj['value'] as T;
  } else {
    return obj as T;
  }
}


export function getPositiveNumber(value: number, alt: number) {
  return value && value > 0 ? value : alt;
}


export function logConstructorName() {
  console.log(`##### constructor: ${this.constructor.name} #####`);
}


export function convertJsonValueToStates(valueLikeJson: any, alt: State[]): State[] {
  const value = valueLikeJson; // rename
  const json: string = value && typeof value === 'string' ? value : null; // rename/retype
  // console.log(json);
  return (json ? JSON.parse(json) : alt) as State[];
}