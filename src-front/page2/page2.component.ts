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
    <h3>Replay</h3>
    <div>{{_$title}}</div>
    <div><ul><li *ngFor="let color of _$colors"><span [style.background-color]="color">{{color}}</span></li></ul></div>
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
    this.service.disposeSubscriptionsBeforeRegister(); // registerSubscriptionsの前に、登録済みのsubscriptionを全て破棄する。
    this.registerSubscriptionsEveryEntrance(); // ページ遷移入の度にsubscriptionを作成する。
  }

  registerSubscriptionsEveryEntrance() {
    // 次回ページ遷移入時にunsubscribeするsubscription群。
    this.service.disposableSubscriptions = [
      this.state.titles$
        .do(titles => console.log('DetectChange: ' + titles[2] + ' -> ' + titles[1] + ' -> ' + titles[0] + ' on Page2'))
        .subscribe(),

      this.state.titleReplayStream$$
        .do(title => this._$title = title)
        .subscribe(() => this.cd.markForCheck()),

      this.state.colorsReplayStream$$
        .do(colors => this._$colors = colors)
        .subscribe(() => this.cd.markForCheck()),
    ];
  }

  get title() { return this.state.title; }

  // Observableにより更新される変数なので勝手に変更しないこと。;
  private _$title: string;
  private _$colors: string[];
}