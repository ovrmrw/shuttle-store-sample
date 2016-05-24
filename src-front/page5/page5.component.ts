import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import lodash from 'lodash';

import { ComponentGuidelineUsingStore } from '../shuttle-store';
import { Page5Service, Page5State } from './page5.service';

///////////////////////////////////////////////////////////////////////////////////
// Main Component
@Component({
  selector: 'sg-page5',
  template: `
    <h2>{{title}} - PAGE5</h2>
    <hr />
    <div>ページ遷移してもリロードしても入力した値を失わないフォームのサンプル。</div>
    <hr />
    <div>FirstName: <input type="text" [(ngModel)]="_$form.firstName" /></div>
    <div>LastName: <input type="text" [(ngModel)]="_$form.lastName" /></div>
    <div>Age: <input type="number" [(ngModel)]="_$form.age" /></div>
    <div>Gender: <input type="text" [(ngModel)]="_$form.gender" /></div>
    <div>Address: <input type="text" [(ngModel)]="_$form.address" /></div>
    <div>Tel: <input type="text" [(ngModel)]="_$form.tel" /></div>
    <div>Fax: <input type="text" [(ngModel)]="_$form.fax" /></div>
    <div><button (click)="clearForm()">Clear Form</button></div>
    <hr />
    <h3>Replay</h3>
    <div>{{_$formReplay | json}}</div>
  `,
  providers: [Page5Service, Page5State],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Page5Component implements OnInit, ComponentGuidelineUsingStore {
  constructor(
    private service: Page5Service,
    private state: Page5State,
    private cd: ChangeDetectorRef
  ) { }
  ngOnInit() {
    this.service.disposeSubscriptionsBeforeRegister(); // registerSubscriptionsの前に、登録済みのsubscriptionを全て破棄する。
    this.registerSubscriptionsEveryEntrance(); // ページ遷移入の度にsubscriptionを作成する。
  }

  registerSubscriptionsEveryEntrance() {
    // 次回ページ遷移入時にunsubscribeするsubscription群。
    this.service.disposableSubscriptions = [
      // キーボード入力の度にStoreにフォームのStateを送る。
      Observable.fromEvent<KeyboardEvent>(document.getElementsByTagName('sg-page5'), 'keyup')
        .debounceTime(250)
        .do(() => this.service.setForm(this._$form).log('Form'))
        .subscribe(() => this.cd.markForCheck()),

      // StoreからフォームのStateを受け取る。
      this.state.form$
        .do(form => this._$form = form)
        .subscribe(),

      // 入力した履歴をリプレイ。特に意味はない。
      this.state.formReplayStream$$
        .do(form => this._$formReplay = form)
        .subscribe(() => this.cd.markForCheck()),
    ];
  }

  clearForm() {
    this.service.setForm(new FormData()).log('Initialize Form')
  }

  get title() { return this.state.title; }

  private _$form: FormData = new FormData();
  private _$formReplay: FormData;
}


///////////////////////////////////////////////////////////////////////////////////
// FormData Class
export class FormData {
  firstName: string;
  lastName: string;
  age: number;
  address: string;
  tel: string;
  fax: string;
  gender: string;
}