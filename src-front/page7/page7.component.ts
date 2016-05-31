import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { Control, ControlArray, ControlGroup, Validators } from '@angular/common';
import { Observable } from 'rxjs/Rx';
import lodash from 'lodash';

import { ComponentGuidelineUsingStore } from '../shuttle-store';
import { Page7Service, Page7State } from './page7.service';

///////////////////////////////////////////////////////////////////////////////////
// Main Component
@Component({
  selector: 'sg-page7',
  template: `
    <h2>{{title}} - PAGE7</h2>
    <hr />
    <div>Page5のフォームをControl,ControlGroup,Validatorsを使って書き直したものです。</div>
    <div>バリデーションとデータ永続化を組み合わせた例です。</div>    
    <hr />
    <form [ngFormModel]="formGroup">
      <div ngControlGroup="person">
        <div ngControlGroup="name">
          <div>First: <input type="text" ngControl="first" [(ngModel)]="form.firstName" /><span *ngIf="!ctrl.firstName.valid">[invalid!]</span></div>
          <div>Last: <input type="text" ngControl="last" [(ngModel)]="form.lastName" /><span *ngIf="!ctrl.lastName.valid">[invalid!]</span></div>
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
        <div *ngFor="let i of emailsRange">Email{{i + 1}}: <input type="text" ngControl="{{i}}" [(ngModel)]="form.emails[i]" /></div>
      </div>
    </form>
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
    private cd: ChangeDetectorRef
  ) { }
  ngOnInit() {
    this.service.disposeSubscriptionsBeforeRegister(); // registerSubscriptionsの前に、登録済みのsubscriptionを全て破棄する。
    this.registerSubscriptionsEveryActivate(); // ページ遷移入の度にsubscriptionを作成する。
  }

  registerSubscriptionsEveryActivate() {
    // 次回ページ遷移入時にunsubscribeするsubscription群。
    this.service.disposableSubscriptions = [
      // キーボード入力の度にStoreにフォームのStateを送る。
      this.formGroup.valueChanges
        .debounceTime(200)
        .do(() => this.service.putForm(this.form).log('Form'))
        .do(group => this._$formJson = JSON.stringify(group, null, 2))
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
                this.ctrl.emails.push(new Control('', Validators.minLength(5)));
              });
            }
          }
          return form;
        })
        .do(form => this.form = form)
        .subscribe(() => this.cd.markForCheck()), // 要らなそうで要る。
    ];
  }

  clearForm() {
    this.service.putForm(new FormData()).log('Initialize Form');
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

  clearState() {
    this.service.clearStatesAndStorage();
  }

  private form: FormData;
  private _$formJson: string;

  private ctrl: FormControl = new FormControl();
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
    emails: this.ctrl.emails,
  });
}


///////////////////////////////////////////////////////////////////////////////////
// FormData Class
export class FormData implements FormControlable {
  firstName: string;
  lastName: string;
  age: number;
  address: AddressData;
  tel: string;
  fax: string;
  gender: string;
  emails: string[] = [''];
  constructor() { this.address = new AddressData(); }
}
class AddressData implements AddressControlable {
  zipCode: string;
  street: string;
}


class FormControl /*implements FormControlable*/ {
  firstName = new Control('', Validators.required);
  lastName = new Control('', Validators.required);
  age = new Control('', Validators.compose([Validators.required, Validators.pattern('[0-9]+')]));
  gender = new Control('', Validators.required);
  tel = new Control('', Validators.compose([Validators.required, Validators.pattern('[0-9\-]+')]));
  fax = new Control('', Validators.compose([Validators.required, Validators.pattern('[0-9\-]+')]));
  emails = new ControlArray([new Control('', Validators.minLength(5))]);
  address: AddressControl;
  constructor() { this.address = new AddressControl(); }
}
class AddressControl implements AddressControlable {
  zipCode = new Control('', Validators.required);
  street = new Control('', Validators.required);
}


interface FormControlable {
  firstName: string | Control;
  lastName: string | Control;
  age: number | Control;
  address: AddressControlable;
  tel: string | Control;
  fax: string | Control;
  gender: string | Control;
  emails: string[] | ControlArray;
}
interface AddressControlable {
  zipCode: string | Control;
  street: string | Control;
}