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
    <div>FirstName: <input type="text" [(ngModel)]="form.firstName" /></div>
    <div>LastName: <input type="text" [(ngModel)]="form.lastName" /></div>
    <div>Age: <input type="number" [(ngModel)]="form.age" /></div>
    <div>Gender: <input type="text" [(ngModel)]="form.gender" /></div>
    <div>ZipCode: <input type="text" [(ngModel)]="form.address.zipCode" /></div>
    <div>Street: <input type="text" [(ngModel)]="form.address.street" /></div>
    <div>Tel: <input type="text" [(ngModel)]="form.tel" /></div>
    <div>Fax: <input type="text" [(ngModel)]="form.fax" /></div>
    <div><button (click)="clearForm()">Clear Form</button></div>
    <div><button (click)="rollback()">UNDO (Rollback)</button></div>
    <div><button (click)="revertRollback()">REDO (Revert Rollback)</button></div>
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
      Observable.fromEvent<KeyboardEvent>(document.querySelectorAll('sg-page5 input'), 'keyup')
        .debounceTime(250)
        .do(() => console.log(this.form))
        .do(() => this.service.setForm(this.form).log('Form'))
        .subscribe(),

      // StoreからフォームのStateを受け取る。nullを受け取ったときはnew FormData()する。
      this.state.form$
        .do(form => form ? this.form = form : this.form = new FormData())
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

  rollback() {
    this.service.rollback(null, { withCommit: true });
  }
  revertRollback() {
    this.service.revertRollback({ withCommit: true });
  }

  get title() { return this.state.title; }

  private form: FormData;
  private _$formReplay: FormData;
}


///////////////////////////////////////////////////////////////////////////////////
// FormData Class
export class FormData {
  firstName: string;
  lastName: string;
  age: number;
  address: Address;
  tel: string;
  fax: string;
  gender: string;
  constructor() { this.address = new Address(); }
}

class Address {
  zipCode: string;
  street: string;
}