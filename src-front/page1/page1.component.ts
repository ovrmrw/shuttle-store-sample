import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';

import { ComponentGuidelineUsingStore } from '../shuttle-store';
import { Page1Service, Page1State } from './page1.service';

///////////////////////////////////////////////////////////////////////////////////
// Main Component
@Component({
  selector: 'sg-page1',
  template: `
    <h2>{{title}} - PAGE1</h2>
    <hr />
    <div>ここで入力したタイトルは全てのページで使われます。</div>
    <div>Colorはどんどんリストに追加されていきますが、30秒経過すると次のStore更新時に消えるようになっています。</div>
    <hr />
    <h3>Settings</h3>
    <div>Title: <input type="text" [(ngModel)]="title" /></div>
    <div>Color: <input type="text" [(ngModel)]="color" /><button (click)="setColor()">Push</button></div>    
    <hr />
    <h3>Replay</h3>
    <div>{{_$title}}</div>
    <div><ul><li *ngFor="let color of _$colors"><span [style.background-color]="color">{{color}}</span></li></ul></div>
    <hr />
    <div><button (click)="clearState()">Clear State</button></div>
  `,
  providers: [Page1Service, Page1State],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Page1Component implements OnInit, ComponentGuidelineUsingStore {
  constructor(
    private service: Page1Service,
    private state: Page1State,
    private cd: ChangeDetectorRef
  ) { }
  ngOnInit() {
    this.service.disposeSubscriptionsBeforeRegister(); // registerSubscriptionsの前に、登録済みのsubscriptionを全て破棄する。
    this.registerSubscriptionsEveryActivate(); // ページ遷移入の度にsubscriptionを作成する。
  }

  registerSubscriptionsEveryActivate() {
    // 次回ページ遷移入時にunsubscribeするsubscription群。
    this.service.disposableSubscriptions = [
      this.state.titles$
        .do(titles => console.log('DetectChange: ' + titles[2] + ' -> ' + titles[1] + ' -> ' + titles[0] + ' on Page1'))
        .subscribe(),

      this.state.titleReplayStream$$
        .do(title => this._$title = title)
        .subscribe(() => this.cd.markForCheck()),

      this.state.colorsReplayStream$$
        .do(colors => this._$colors = colors)
        .subscribe(() => this.cd.markForCheck()),
    ];
  }

  set title(data: string) { this.service.putTitle(data).log('Title'); }
  get title() { return this.state.title; }

  color: string;

  setColor() {
    this.service.putColor(this.color).log('Color');
    this.color = '';
  }

  clearState() {
    this.service.clearStatesAndStorage();
  }

  // Observableにより更新される変数なので勝手に変更しないこと。;
  private _$title: string;
  private _$colors: string[];
}