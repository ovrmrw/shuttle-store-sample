import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, ElementRef } from '@angular/core';
import { Control, ControlArray, ControlGroup, Validators } from '@angular/common';
import { Observable } from 'rxjs/Rx';
import lodash from 'lodash';

import { ComponentGuidelineUsingStore } from '../shuttle-store';
import { Page7Service, Page7State } from './page7.service';
import { FormData, FormControl } from './page7.type';


///////////////////////////////////////////////////////////////////////////////////
// Main Component
@Component({
  selector: 'sg-page7',
  template: `
    <h2>{{title}} - PAGE7</h2>
    <hr />
    <p>(English) This is a rewrite of Page5 with Validations.</p>
    <p>This Form show you an integration "how to persist the data" and "validate the data".</p> 
    <p>(Japanese) Page5のフォームをControl,ControlArray,ControlGroup,Validatorsを使って書き直したものです。</p>
    <p>(動的に入力欄の数を変更させる場合ControlArray周りが若干ややこしくなります。)</p>
    <p>複数のStoreで構成されており、ブラウザタブ切り替えをしたときにタイトルは更新されますがフォームは勝手に更新されないようになっています。</p>    
    <hr />
    <form [ngFormModel]="formGroup">
      <div ngControlGroup="person">
        <div ngControlGroup="name">
          <div>FirstName: <input type="text" ngControl="first" [(ngModel)]="form.firstName" /><span *ngIf="!ctrl.firstName.valid">[invalid!]</span></div>
          <div>LastName: <input type="text" ngControl="last" [(ngModel)]="form.lastName" /><span *ngIf="!ctrl.lastName.valid">[invalid!]</span></div>
        </div>
        <div>Age: <input type="text" ngControl="age" [(ngModel)]="form.age" /><span *ngIf="!ctrl.age.valid">[invalid!]</span></div>
        <div>Gender: <input type="text" ngControl="gender" [(ngModel)]="form.gender" /><span *ngIf="!ctrl.gender.valid">[invalid!]</span></div>
      </div>
      <div ngControlGroup="address">
        <div>ZipCode: <input type="text" ngControl="zipCode" [(ngModel)]="form.address.zipCode" /><span *ngIf="!ctrl.address.zipCode.valid">[invalid!]</span></div>
        <div>Street: <input type="text" ngControl="street" [(ngModel)]="form.address.street" /><span *ngIf="!ctrl.address.street.valid">[invalid!]</span></div>
      </div>
      <div ngControlGroup="tel&fax">
        <div>Tel: <input type="text" ngControl="tel" [(ngModel)]="form.tel" /><span *ngIf="!ctrl.tel.valid">[invalid!]</span></div>
        <div>Fax: <input type="text" ngControl="fax" [(ngModel)]="form.fax" /><span *ngIf="!ctrl.fax.valid">[invalid!]</span></div>
      </div>
      <div ngControlGroup="emails">
        <div *ngFor="let i of emailsRange">Email{{i + 1}}: <input type="text" ngControl="{{i}}" [(ngModel)]="form.emails[i]" /><span *ngIf="!ctrl.emails[i].valid">[invalid!]</span></div>
      </div>
    </form>
    <h4>Validation: {{formGroup.valid}}</h4>
    <div><button (click)="clearForm()">Clear Form</button></div>
    <div><button (click)="rollback()">UNDO (Rollback)</button></div>
    <div><button (click)="revertRollback()">REDO (Revert Rollback)</button></div>
    <hr />
    <h3>Form Value</h3>
    <div><pre>{{_$formJson}}</pre></div>
    <hr />
    <div><button (click)="clearState()">Clear State</button></div>
  `,
  providers: [Page7Service, Page7State],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Page7Component implements OnInit, ComponentGuidelineUsingStore {
  constructor(
    private service: Page7Service,
    private state: Page7State,
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
        .debounceTime(100)
        .do(() => this.service.putForm(this.form).then(x => x.log('Form')))
        .subscribe(),

      // StoreからフォームのStateを受け取る。nullを受け取ったときはnew FormData()する。
      this.state.form$
        .map(form => form ? form : new FormData())
        .map(form => { // メールアドレス入力欄の数を動的に変更する。
          if (form.emails.length >= form.emails.filter(email => !!email).length) {
            form.emails = form.emails.filter(email => !!email);
            form.emails.push('');

            if (form.emails.length > this.ctrl.emails.length) {
              lodash.range(0, form.emails.length - this.ctrl.emails.length).forEach(() => {
                // this.ctrl.emails.push(new Control('', Validators.minLength(5)));
                this.emailsCtrlArray.push(new Control('', Validators.minLength(5)));
              });
            }
          }
          return form;
        })
        .do(form => this.form = form)
        .subscribe(() => this.cd.markForCheck()), // 要らなそうで要る。

      // formGroupの値が変わる度にViewの表示を更新する。
      this.formGroup.valueChanges
        .debounceTime(100)
        .do(group => this._$formJson = JSON.stringify(group, null, 2))
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


  ctrl: FormControl = new FormControl();
  
  emailsCtrlArray = new ControlArray(this.ctrl.emails); // formGroupの外に定義していないと動的に入力欄の数を変更できない。
  
  formGroup = new ControlGroup({ // 最終的にこの形でデータを取得することができる。
    person: new ControlGroup({
      name: new ControlGroup({
        first: this.ctrl.firstName,
        last: this.ctrl.lastName,
      }),
      age: this.ctrl.age,
      gender: this.ctrl.gender,
    }),
    address: new ControlGroup({
      zipCode: this.ctrl.address.zipCode,
      street: this.ctrl.address.street,
    }),
    'tel&fax': new ControlGroup({
      tel: this.ctrl.tel,
      fax: this.ctrl.fax,
    }),
    emails: this.emailsCtrlArray, // ここはControlArrayでなければならない。Controlの配列ではNG。
  });
  
  
  private form: FormData;
  private _$formJson: string;
}