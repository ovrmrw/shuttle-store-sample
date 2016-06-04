import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, provide } from '@angular/core';
import { OnActivate } from '@angular/router-deprecated';

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
    <div>Title: <input type="text" [(ngModel)]="title" /><button (click)="lockTitle()">Lock Title</button><button (click)="unlockTitle()">Unlock Title</button></div>
    <div>Color: <input type="text" #color /><button (click)="setColor(color)">Push</button></div>    
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
    this.service.SC.initializeWatchingSubscriptionsBeforeRegisterOnInit(this.cd); // 登録済みの変更監視Subscriptionを全て破棄する。
    this.registerWatchingSubscriptionsAfterInitializeOnInit(); // ページ遷移入の度に変更監視Subscriptionを登録する。
  }


  registerWatchingSubscriptionsAfterInitializeOnInit() {
    // 次回ページ遷移入時にunsubscribeするsubscription群。
    this.service.SC.disposableSubscriptions = [
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


  lockTitle() {
    this.service.putTitleWithLock(this.title).then(x => x.log('Title with lock'));
  }

  unlockTitle() {
    this.service.unlockTitle().then(x => x.log('Unlock Title'));
  }


  setColor(el: HTMLInputElement) {
    this.service.putColor(el.value).then(x => x.log('Color'));
    el.value = '';
  }


  clearState() {
    this.service.SC.clearAllStatesAndAllStorages();
  }


  set title(data: string) { this.service.putTitle(data).then(x => x.log('Title')); }
  get title() { return this.state.title; }


  // Observableにより更新される変数なので勝手に変更しないこと。;
  private _$title: string;
  private _$colors: string[];
}