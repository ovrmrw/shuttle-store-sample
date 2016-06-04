import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, ElementRef } from '@angular/core';
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
    <p>(English) The Form sample which keeps the data you input even if page reload or page move happens.</p>
    <p>You can use Undo/Redo feature which affects not only this page but also, for instance the Title field of Page1.</p>
    <p>This page consists of the Multi Stores. In the Angular2 DI space, there are not a Store instance but three Store instances.</p>
    <p>Due to the Multi Stores, you can enable the Auto-Refresh feature of the Store individually.</p> 
    <p>(Japanese) ページ遷移してもリロードしても入力した値を失わないフォームのサンプル。Email入力欄は数が動的に変化します。</p>
    <p>Undo/Redoができます。このページだけでなくPage1のタイトル等までUndo/Redoは波及します。</p>
    <p>複数のStoreで構成されており、ブラウザタブ切り替えをしたときにタイトルは更新されますがフォームは勝手に更新されないようになっています。</p>
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
    <div><pre>{{_$formReplay}}</pre></div>
    <hr />
    <div><button (click)="clearState()">Clear State</button></div>
  `,
  providers: [Page5Service, Page5State],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Page5Component implements OnInit, ComponentGuidelineUsingStore {
  constructor(
    private service: Page5Service,
    private state: Page5State,
    private cd: ChangeDetectorRef,
    private el: ElementRef
  ) { }
  
  ngOnInit() {
    this.service.SC.initializeWatchingSubscriptionsBeforeRegisterOnInit(this.cd); // 登録済みの変更監視Subscriptionを全て破棄する。
    this.registerWatchingSubscriptionsAfterInitializeOnInit(); // ページ遷移入の度に変更監視Subscriptionを登録する。
  }


  registerWatchingSubscriptionsAfterInitializeOnInit() {
    // 次回ページ遷移入時にunsubscribeするsubscription群。
    this.service.SC.disposableSubscriptions = [
      // キーボード入力の度にStoreにフォームのStateを送る。
      Observable.fromEvent<KeyboardEvent>(this.el.nativeElement, 'keyup')
        .debounceTime(200)
        .do(() => this.service.putForm(this.form).then(x => x.log('Form')))
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
        .subscribe(() => this.cd.markForCheck()), // 要らなそうで要る。

      // 入力した履歴をリプレイ。特に意味はない。
      this.state.formReplayStream$$
        .do(form => this._$formReplay = JSON.stringify(form))
        .subscribe(() => this.cd.markForCheck()),
    ];
  }


  rollback() {
    this.service.SC.rollback();
  }
  
  revertRollback() {
    this.service.SC.revertRollback();
  }


  clearForm() {
    this.service.putForm(new FormData()).then(x => x.log('Initialize Form'));
  }

  clearState() {
    this.service.SC.clearAllStatesAndAllStorages();
  }


  get title() { return this.state.title; }

  // このrangeを用意しておかないとtemplateでうまくngForできない。本当はこんなことしたくない。
  get emailsRange() { return lodash.range(0, this.form.emails.length); }
  
  
  private form: FormData;
  private _$formReplay: FormData | string;
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