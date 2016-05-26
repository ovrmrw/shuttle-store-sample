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
    <!--
    <div *ngIf="form.emails.length > 0">Email1: <input type="text" [(ngModel)]="form.emails[0]" /></div>
    <div *ngIf="form.emails.length > 1">Email2: <input type="text" [(ngModel)]="form.emails[1]" /></div>
    <div *ngIf="form.emails.length > 2">Email3: <input type="text" [(ngModel)]="form.emails[2]" /></div>
    -->
    <div *ngFor="let i of emailsRange">Email{{i + 1}}: <input type="text" [(ngModel)]="form.emails[i]" /></div>
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
      Observable.fromEvent<KeyboardEvent>(document.querySelector('sg-page5'), 'keyup')
        .debounceTime(200)
        .do(() => this.service.setForm(this.form).log('Form'))
        .subscribe(),

      // StoreからフォームのStateを受け取る。nullを受け取ったときはnew FormData()する。
      this.state.form$
        .map(form => form ? form : new FormData())
        .map(form => { // メールアドレス入力欄の数を動的に変更する。
          if (form.emails.length >= form.emails.filter(email => !!email).length) {
            form.emails = form.emails.filter(email => !!email);
            form.emails.push('');
          }
          return form;
        })
        .do(form => this.form = form)
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
    this.service.rollback({ withCommit: true });
  }
  revertRollback() {
    this.service.revertRollback({ withCommit: true });
  }

  get title() { return this.state.title; }

  // このrangeを用意しておかないとtemplateでうまくngForできない。本当はこんなことしたくない。
  get emailsRange() { return lodash.range(0, this.form.emails.length); }

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
  emails: string[] = [''];
  constructor() { this.address = new Address(); }
}

class Address {
  zipCode: string;
  street: string;
}