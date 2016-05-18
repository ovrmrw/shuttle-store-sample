import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';

import { AppPage4Service, AppPage4State } from './page4.service';
import { ComponentGuidelineUsingStore } from '../store';
import { Translation } from '../types.ref';

///////////////////////////////////////////////////////////////////////////////////
// Main Component
@Component({
  selector: 'sg-page4',
  template: `
    <div>ServiceでStateを用意して、Component側の記述をシンプルにする手法。</div>
    <hr />
    <h2>{{_$title}} - PAGE4</h2>
    <div>{{_$text}}</div>
    <hr />
    <h2>{{title}} - PAGE4</h2>
    <div>{{text}}</div>
    <hr />
    <h2>{{title$ | async}} - PAGE4</h2>
    <div>{{text$ | async}}</div>
  `,
  providers: [AppPage4Service, AppPage4State],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppPage4Component implements OnInit, ComponentGuidelineUsingStore {
  private static isSubscriptionsRegistered: boolean;

  constructor(
    private service: AppPage4Service,
    private state: AppPage4State,
    private cd: ChangeDetectorRef
  ) { }
  ngOnInit() {
    this.service.disposeSubscriptionsBeforeRegister(); // registerSubscriptionsの前に、登録済みのsubscriptionを全て破棄する。
    this.registerSubscriptionsEveryEntrance(); // ページ遷移入の度にsubscriptionを作成する。
    this.registerSubscriptionsOnlyOnce(); // 最初にページ遷移入したときだけsubscriptionを作成する。
  }

  registerSubscriptionsEveryEntrance() {
    this.service.disposableSubscriptions = [
      // Observableなvalueをプリミティブに変換してViewにPUSHで流し込むやり方。
      this.state.text$
        .subscribe(text => this._$text = text), // subscribeの中でComponentの変数に値を渡す。(side-effect)

      this.state.title$
        .do(title => this._$title = title) // doの中でComponentの変数に値を渡しても良い。但しsubscribeは必要。(side-effect)
        .subscribe(),
    ];
  }

  registerSubscriptionsOnlyOnce() {
    if (!AppPage4Component.isSubscriptionsRegistered) {
      // your subscription code
    }
    AppPage4Component.isSubscriptionsRegistered = true;
  }

  // プリミティブなvalueをView表示時にPULLで取得するやり方。
  get title() { return this.state.title; }
  get text() { return this.state.text; }

  // ObservableなvalueをAsyncパイプを通してViewにPUSHで流し込むやり方。
  get title$() { return this.state.title$; }
  get text$() { return this.state.text$; }

  // Observableにより更新される変数なので勝手に変更しないこと。
  private _$title: string;
  private _$text: string;
}