import { Injectable } from '@angular/core';
import { Jsonp } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import lodash from 'lodash';

import { Store, AbstractStoreState } from '../shuttle-store';
import { AppService } from '../services.ref';

////////////////////////////////////////////////////////////////////////////
// Service
@Injectable()
export class Page6Service extends AppService {
  // this.storeはデフォルトのStoreだが、this.localStoreは2番目のStore。
  localStore: Store;
  constructor(store: Store, private jsonp: Jsonp) {
    super(store);
    this.localStore = this.getStoreSafely('second'); // 'second'という名称で取得に失敗すると自動的に1番目のStoreを返す。
    console.log('===== localStore(second) =====');
    console.log(this.localStore);
  }

  requestWiki(keyword: string): Observable<any> {
    const _keyword = encodeURIComponent(keyword);
    return this.jsonp.get('https://ja.wikipedia.org/w/api.php?format=json&action=query&prop=revisions&rvprop=content&titles=' + _keyword + '&callback=JSONP_CALLBACK')
      .map(res => res.json());
  }

  requestWikiLikeFalcor(keyword: string): Observable<any> {
    if (keyword.length === 0) { return Observable.of({ 'error': 'No keyword is not accepted.' }); }
    const identifier = [...S._WIKIPEDIA_, JSON.stringify({ keyword })];
    const cache = this.localStore.takeLatest<any>(identifier); // キャッシュがあるか探す。
    if (cache) { // キャッシュがあればそれを返す。なければHTTPリクエストする。
      console.log('Wiki data from cache, not from HTTP request.');
      return Observable.of(cache);
    } else {
      const _keyword = encodeURIComponent(keyword);
      return this.jsonp.get('https://ja.wikipedia.org/w/api.php?format=json&action=query&prop=revisions&rvprop=content&titles=' + _keyword + '&callback=JSONP_CALLBACK')
        .map(res => res.json())
        .do(data => this.localStore.put(data, identifier, { limit: 1, rollback: false }).then(x => x.log('Wiki')))
        .do(() => console.log('Wiki data from HTTP request.'));
    }
  }
}

const S = Page6Service; // shorthand

////////////////////////////////////////////////////////////////////////////
// State (Declared only getters from Store)
@Injectable()
export class Page6State extends AbstractStoreState {
  constructor(store: Store) { super(store); }

  get title() { return this.store.takeLatest<string>(S._TITLE_); }
}