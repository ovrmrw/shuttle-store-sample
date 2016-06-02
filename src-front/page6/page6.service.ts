import { Injectable } from '@angular/core';
import { Jsonp } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import lodash from 'lodash';

import { Store } from '../shuttle-store';
import { AppService, AppState, STORE_SECOND } from '../services.ref';

////////////////////////////////////////////////////////////////////////////
// Service
@Injectable()
export class Page6Service extends AppService {
  constructor(store: Store, private jsonp: Jsonp) { super(store); }
  secondStore: Store = this.getStoreSafely(STORE_SECOND); // Wikipediaのデータを保存するためのStore

  requestWiki(keyword: string): Observable<any> {
    const _keyword = encodeURIComponent(keyword);
    return this.jsonp.get('https://ja.wikipedia.org/w/api.php?format=json&action=query&prop=revisions&rvprop=content&titles=' + _keyword + '&callback=JSONP_CALLBACK')
      .map(res => res.json());
  }

  requestWikiLikeFalcor(keyword: string): Observable<any> {
    if (keyword.length === 0) { return Observable.of({ 'error': 'No keyword is not accepted.' }); }
    const identifier = [...S._WIKIPEDIA_, JSON.stringify({ keyword })];
    const cache = this.secondStore.takeLatest<any>(identifier); // キャッシュがあるか探す。
    if (cache) { // キャッシュがあればそれを返す。なければHTTPリクエストする。
      console.log('Wiki data from cache, not from HTTP request.');
      return Observable.of(cache);
    } else {
      const _keyword = encodeURIComponent(keyword);
      return this.jsonp.get('https://ja.wikipedia.org/w/api.php?format=json&action=query&prop=revisions&rvprop=content&titles=' + _keyword + '&callback=JSONP_CALLBACK')
        .map(res => res.json())
        .do(data => this.secondStore.put(data, identifier, { limit: 1, rollback: false }).then(x => x.log('Wiki')))
        .do(() => console.log('Wiki data from HTTP request.'));
    }
  }
}

const S = Page6Service; // shorthand

////////////////////////////////////////////////////////////////////////////
// State (Declared only getters from Store)
@Injectable()
export class Page6State extends AppState {
  constructor(store: Store) { super(store); }

  get title() { return this.mainStore.takeLatest<string>(S._TITLE_); }
}