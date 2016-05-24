import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { ComponentGuidelineUsingStore } from '../shuttle-store';
import { Page3Service, Page3State } from './page3.service';

///////////////////////////////////////////////////////////////////////////////////
// Main Component
@Component({
  selector: 'sg-page3',
  template: `
    <h2>{{title}} - PAGE3</h2>
    <hr />
    <h3>A very simple way to save input values and load them when you re-enter this page. (NOT USING STORE, BUT JUST LOCALSTORAGE)</h3>
    <h1>DEPRECATED</h1>
    <hr />
    <div>String: <input type="text" [(ngModel)]="str_global" />{{str_global}}</div>
    <div>Number: <input type="text" [(ngModel)]="num" />{{num}}</div>
    <div>Boolean: <input type="text" [(ngModel)]="bool" />{{bool}}</div>
    <div>Any: <input type="text" [(ngModel)]="objHasValue" />{{objHasValue}}</div>
  `,
  providers: [Page3Service, Page3State],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Page3Component implements OnInit, ComponentGuidelineUsingStore {
  constructor(
    private service: Page3Service,
    private state: Page3State,
    private cd: ChangeDetectorRef
  ) { }
  ngOnInit() {
    this.service.loadPrimitiveValuesFromLocalStorage(this); // inputタグの値を復元する。
    // -----
    this.service.disposeSubscriptionsBeforeRegister(); // registerSubscriptionsの前に、登録済みのsubscriptionを全て破棄する。
    this.registerSubscriptionsEveryEntrance(); // ページ遷移入の度にsubscriptionを作成する。
  }

  registerSubscriptionsEveryEntrance() {
    // 次回ページ遷移入時にunsubscribeするsubscription群。
    this.service.disposableSubscriptions = [
      Observable.interval(1000)
        .subscribe(() => {
          // inputタグの値を保存する。
          this.service.savePrimitiveValuesToLocalStorage(this, [this.service, this.state, this.cd]);
        }),
    ];
  }

  get title() { return this.state.title; }

  str_global: string;
  num: number;
  bool: boolean;
  objHasValue: any = 'default value';
}