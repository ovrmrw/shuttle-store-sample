import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import lodash from 'lodash';

import { ComponentGuidelineUsingStore } from '../shuttle-store';
import { Page6Service, Page6State } from './page6.service';

///////////////////////////////////////////////////////////////////////////////////
// Main Component
@Component({
  selector: 'sg-page6',
  template: `
    <h2>{{title}} - PAGE6</h2>
    <hr />
    <div>Wikipedia APIでキーワード検索します。初めてのときはHTTPリクエストしますが、2回目以降は同じキーワードで検索したときにキャッシュから取得するのでHTTPリクエストは発生しません。</div>
    <hr />
    <div>Keyword: <input type="text" [(ngModel)]="keyword" /></div>
    <div><button (click)="requestWiki()">Wikipedia Search</button></div>
    <hr />
    {{_$result | json}}
  `,
  providers: [Page6Service, Page6State],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Page6Component implements OnInit, ComponentGuidelineUsingStore {
  constructor(
    private service: Page6Service,
    private state: Page6State,
    private cd: ChangeDetectorRef
  ) { }
  ngOnInit() {
    this.service.disposeSubscriptionsBeforeRegister(); // registerSubscriptionsの前に、登録済みのsubscriptionを全て破棄する。
    this.registerSubscriptionsEveryEntrance(); // ページ遷移入の度にsubscriptionを作成する。
  }

  registerSubscriptionsEveryEntrance() {
    // 次回ページ遷移入時にunsubscribeするsubscription群。
    this.service.disposableSubscriptions = [

    ];
  }

  // Falcorのように一度取得したデータはキャッシュされ、次回はキャッシュから取得する。
  requestWiki() {
    this._$result = 'Requesting...';
    this.service.requestWikiLikeFalcor(this.keyword)
      .do(result => this._$result = result)
      .do(result => console.log(result))
      .subscribe(() => this.cd.markForCheck());
  }

  get title() { return this.state.title; }

  private keyword: string;
  private _$result: {} | string;
}