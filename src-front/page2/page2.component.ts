import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';

import { AppPage2Service, AppPage2State } from './page2.service';
import { ComponentGuidelineUsingStore } from '../store';
import { Translation } from '../types.ref';

///////////////////////////////////////////////////////////////////////////////////
// Main Component
@Component({
  selector: 'sg-page2',
  template: `
    <h2>{{title}} - PAGE2</h2>
    <div>
      Title: <input type="text" [(ngModel)]="title" />
    </div>
    <ul><li *ngFor="let t of _$translations">Japanese: {{t.text}} / English: {{t.translated}}</li></ul>
    <hr />
    <button (click)="onClickClearStates($event)">Clear States</button>
    <hr />
    <h3>Replay of title input history</h3>
    <div>{{_$titleReplayStream}}</div>
  `,
  providers: [AppPage2Service, AppPage2State],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppPage2Component implements OnInit, ComponentGuidelineUsingStore {
  private static isSubscriptionsRegistered: boolean;

  constructor(
    private service: AppPage2Service,
    private state: AppPage2State,
    private cd: ChangeDetectorRef
  ) { }
  ngOnInit() {
    this.service.disposeSubscriptionsBeforeRegister(); // registerSubscriptionsの前に、登録済みのsubscriptionを全て破棄する。
    this.registerSubscriptionsEveryEntrance(); // ページ遷移入の度にsubscriptionを作成する。
    this.registerSubscriptionsOnlyOnce(); // 最初にページ遷移入したときだけsubscriptionを作成する。
  }

  registerSubscriptionsEveryEntrance() {
    this.service.disposableSubscriptions = [
      this.state.titles$
        .do(titles => console.log('DetectChange: ' + titles[2] + ' -> ' + titles[1] + ' -> ' + titles[0] + ' on Page2'))
        .subscribe(),

      this.state.translations$$
        .map(ary => ary.slice(0, 30))
        .do(translations => this._$translations = translations)
        .do(translations => console.log('DetectChange: ' + (translations.length > 2 ? translations[2].translated : undefined) + ' -> ' + (translations.length > 1 ? translations[1].translated : undefined) + ' -> ' + (translations.length > 0 ? translations[0].translated : undefined) + ' on Page2'))
        .subscribe(() => this.cd.markForCheck()), // OnPush環境ではWaitが発生する処理を待機するときにはmarkForCheckが必要。

      this.state.titleReplayStream$$
        .do(title => this._$titleReplayStream = title)
        .do(title => console.log(title))
        .subscribe(() => this.cd.markForCheck()), // OnPush環境ではWaitが発生する処理を待機するときにはmarkForCheckが必要。
    ];
  }

  registerSubscriptionsOnlyOnce() {
    if (!AppPage2Component.isSubscriptionsRegistered) {
      // your subscription code
    }
    AppPage2Component.isSubscriptionsRegistered = true;
  }

  set title(title: string) { this.service.setTitle(title); }
  get title() { return this.state.title; }

  onClickClearStates() {
    this.service.clearStatesAndLocalStorage();
  }

  // Observableにより更新される変数なので勝手に変更しないこと。
  private _$translations: Translation[];
  private _$titleReplayStream: string;
}