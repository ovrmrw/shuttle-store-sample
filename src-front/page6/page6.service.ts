import { Injectable } from '@angular/core';
import { Jsonp } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { Store } from '../shuttle-store';
import { AppService } from '../services.ref';

////////////////////////////////////////////////////////////////////////////
// Service
@Injectable()
export class Page6Service extends AppService {
  constructor(store: Store, private jsonp: Jsonp) { super(store); }

  requestWiki(keyword: string): Observable<{}> {
    const _keyword = encodeURIComponent(keyword);
    return this.jsonp.get('https://ja.wikipedia.org/w/api.php?format=json&action=query&prop=revisions&rvprop=content&titles=' + _keyword + '&callback=JSONP_CALLBACK')
      .map(res => res.json())
  }

  requestWikiLikeFalcor(keyword: string): Observable<{}> {
    const identifier = [...S._WIKIPEDIA_, keyword];
    const cache = this.store.select<any>(identifier); // キャッシュがあるか探す。
    if (cache) { // キャッシュがあればそれを返す。なければHTTPリクエストする。
      console.log('Wiki data from cache, not from HTTP request.');
      return Observable.of(cache);
    } else {
      const _keyword = encodeURIComponent(keyword);
      return this.jsonp.get('https://ja.wikipedia.org/w/api.php?format=json&action=query&prop=revisions&rvprop=content&titles=' + _keyword + '&callback=JSONP_CALLBACK')
        .map(res => res.json())
        .do(data => this.store.put(data, identifier, { limit: 1, rollback: false }).log('Wiki'))
        .do(() => console.log('Wiki data from HTTP request.'));
    }
  }
}

const S = Page6Service; // shorthand

////////////////////////////////////////////////////////////////////////////
// State (Declared only getters from Store)
@Injectable()
export class Page6State {
  constructor(private store: Store) { }

  get title() { return this.store.select<string>(S._TITLE_); }
}