import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import c3 from 'c3';
import lodash from 'lodash';

import { ComponentGuidelineUsingStore } from '../shuttle-store';
import { Page4Service, Page4State } from './page4.service';
import { KeyInput } from '../types.ref';

///////////////////////////////////////////////////////////////////////////////////
// Main Component
@Component({
  selector: 'sg-page4',
  template: `
    <h2>{{title}} - PAGE4</h2>
    <hr />
    <div>Aを押すとグラフ描画が始まり、ピリオドを押すと終わる。abcdefghijklmnopqrstuvwxyz,.の入力速度を計るようにしたい。実装中。</div>
    <hr />
    <div>ABC: <input type="text" [(ngModel)]="abc" id="keyinput" /></div>
    <hr />
    <div>Start: {{startTime}}</div>
    <div>End: {{endTime}}</div>
    <div>Diff: {{diff}}</div>
    <div id="chart"></div>
  `,
  providers: [Page4Service, Page4State],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Page4Component implements OnInit, ComponentGuidelineUsingStore {
  constructor(
    private service: Page4Service,
    private state: Page4State,
    private cd: ChangeDetectorRef
  ) { }
  ngOnInit() {
    // this.service.loadPrimitiveValuesFromLocalStorage(this); // inputタグの値を復元する。
    this.chart = c3.generate({
      bindto: '#chart',
      data: {
        columns: [
          ['data1'],
        ]
      },
      // transition: { duration: 100 }
    });

    this.service.disposeSubscriptionsBeforeRegister(); // registerSubscriptionsの前に、登録済みのsubscriptionを全て破棄する。
    this.registerSubscriptionsEveryEntrance(); // ページ遷移入の度にsubscriptionを作成する。
  }

  registerSubscriptionsEveryEntrance() {
    let previousTime: number;

    // 次回ページ遷移入時にunsubscribeするsubscription群。
    this.service.disposableSubscriptions = [
      Observable.fromEvent<KeyboardEvent>(document.getElementById('keyinput'), 'keyup')
        .do(event => console.log(event))
        .do(event => {
          if (event.keyCode === 65 /* a */) {
            this.timerStart();
            previousTime = this.startTime;
          }
        })
        .do(event => {
          if (this.proccessing) {
            const now = lodash.now();
            const keyInput: KeyInput = {
              value: event['code'],
              time: now,
              uniqueId: this.uniqueId,
              diff: now - previousTime
            };
            console.log(keyInput);
            this.service.setKeyInput(keyInput);
            previousTime = now;
          }
        })
        .do(event => {
          if (event.keyCode === 190 /* period */) {
            this.timerStop();
          }
        })
        .subscribe(),

      this.state.keyInputs$
        .map(objs => objs.filter(obj => obj.uniqueId === this.uniqueId))
        .map(objs => objs.reverse())
        .do(objs => {
          const diffs = objs.map(obj => obj.diff / 1000);
          this.chart.load({
            columns: [
              ['data1', ...diffs]
            ]
          });
        })
        .do(objs => console.log(objs))
        .subscribe(() => this.cd.markForCheck()),
    ];
  }

  get title() { return this.state.title; }

  timerStart() {
    if (!this.proccessing) {
      console.log('timerStart');      
      this.proccessing = true;
      this.startTime = lodash.now();      
      this.uniqueId = '' + this.startTime + lodash.uniqueId();
      this.endTime = null;      
    }
  }

  timerStop() {
    if (this.proccessing) {
      console.log('timerStop');
      this.endTime = lodash.now();
      this.proccessing = false;
    }
  }

  get diff() { return (this.endTime - this.startTime) / 1000 }

  abc: string;
  startTime: number;
  endTime: number;
  proccessing: boolean;
  uniqueId: string;
  chart: c3.ChartAPI;
}

