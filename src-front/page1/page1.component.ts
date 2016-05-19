import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { ComponentGuidelineUsingStore } from '../store';
import { Page1Service, Page1State } from './page1.service';

///////////////////////////////////////////////////////////////////////////////////
// Main Component
@Component({
  selector: 'sg-page1',
  template: `
    <h2>{{title}} - PAGE1</h2>
    <hr />
    <h3>Settings</h3>
    <div>Title: <input type="text" [(ngModel)]="title" /></div>
    <div>Color: <input type="text" [(ngModel)]="color" /><button (click)="setColor()">Push</button></div>
    <div><button (click)="clearState()">Clear State</button></div>
    <hr />
    <h3>Replay</h3>
    <div>{{_$title}}</div>
    <div><ul><li *ngFor="let color of _$colors"><span [style.background-color]="color">{{color}}</span></li></ul></div>
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
    this.registerSubscriptionsEveryEntrance(); // ページ遷移入の度にsubscriptionを作成する。
  }

  registerSubscriptionsEveryEntrance() {
    this._$colors = [];

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

  set title(title: string) { this.service.setTitle(title); }
  get title() { return this.state.title; }

  color: string;

  setColor() {
    this.service.setColor(this.color);
    this.color = '';
    this._$colors = [];
  }

  clearState() {
    this.service.clearStatesAndLocalStorage();
    this._$colors = [];
  }

  // Observableにより更新される変数なので勝手に変更しないこと。;
  private _$title: string;
  private _$colors: string[];
}