import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';

import { ComponentGuidelineUsingStore } from '../shuttle-store';
import { Page2Service, Page2State } from './page2.service';


///////////////////////////////////////////////////////////////////////////////////
// Main Component
@Component({
  selector: 'sg-page2',
  template: `
    <h2>{{title}} - PAGE2</h2>
    <hr />
    <div>Page1で入力した値をリプレイします。これはTrue-time ReplayなのでPage1とは違い"実時間を再現した"リプレイとなります。</div>
    <div>リプレイは通常は昇順方向に展開しますが、降順(Reverse)も簡単にできます。</div>
    <hr />
    <h3>True-time Replay</h3>
    <div>{{_$title}}</div>
    <div><ul><li *ngFor="let color of _$colors"><span [style.background-color]="color">{{color}}</span></li></ul></div>
    <hr />
    <h3>True-time Replay (Reverse)</h3>
    <div>{{_$titleDesc}}</div>
    <div><ul><li *ngFor="let color of _$colorsDesc"><span [style.background-color]="color">{{color}}</span></li></ul></div>
    <hr />
    <div><button (click)="clearState()">Clear State</button></div>
  `,
  providers: [Page2Service, Page2State],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Page2Component implements OnInit, ComponentGuidelineUsingStore {
  constructor(
    private service: Page2Service,
    private state: Page2State,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.service.SC.initializeWatchingSubscriptionsBeforeRegisterOnInit(this.cd); // 登録済みの変更監視Subscriptionを全て破棄する。
    this.registerWatchingSubscriptionsAfterInitializeOnInit(); // ページ遷移入の度に変更監視Subscriptionを登録する。
  }


  registerWatchingSubscriptionsAfterInitializeOnInit() {
    // 次回ページ遷移入時にunsubscribeするsubscription群。
    this.service.SC.disposableSubscriptions = [
      this.state.titles$
        .do(titles => console.log('DetectChange: ' + titles[2] + ' -> ' + titles[1] + ' -> ' + titles[0] + ' on Page2'))
        .subscribe(),

      this.state.titleReplayStream$$
        .do(title => this._$title = title)
        .subscribe(() => this.cd.markForCheck()),

      this.state.titleReplayStreamDesc$$
        .do(title => this._$titleDesc = title)
        .subscribe(() => this.cd.markForCheck()),

      this.state.colorsReplayStream$$
        .do(colors => this._$colors = colors)
        .subscribe(() => this.cd.markForCheck()),

      this.state.colorsReplayStreamDesc$$
        .do(colors => this._$colorsDesc = colors)
        .subscribe(() => this.cd.markForCheck()),
    ];
  }


  clearState() {
    this.service.SC.clearAllStatesAndAllStorages();
  }


  get title() { return this.state.title; }


  // Observableにより更新される変数なので勝手に変更しないこと。;
  private _$title: string;
  private _$titleDesc: string;
  private _$colors: string[];
  private _$colorsDesc: string[];
}