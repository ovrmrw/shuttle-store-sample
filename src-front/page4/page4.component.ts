import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, AfterViewInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import c3 from 'c3';
import lodash from 'lodash';

import { ComponentGuidelineUsingStore } from '../shuttle-store';
import { Page4Service, Page4State } from './page4.service';
import { KeyInput } from '../types.ref';
export { KeyInput };

///////////////////////////////////////////////////////////////////////////////////
// Main Component
@Component({
  selector: 'sg-page4',
  template: `
    <h2>{{title}} - PAGE4</h2>
    <hr />
    <div>Aを押すとグラフ描画が始まり、Zを押すと終わる。AからZまでの入力速度を計るようにしたい。グラフY軸の単位は秒。実装中。</div>
    <hr />
    <div>Input A～Z: <input type="text" [(ngModel)]="text" id="keyinput" /></div>
    <div *ngIf="textFinished">Finished: {{textFinished}}</div>
    <div *ngIf="textMissed">Missed: {{textMissed}}</div>
    <hr />
    <div>Start: {{startTime}}</div>
    <div>End: {{endTime}}</div>
    <div>Result: {{result}}</div>
    <div id="chart"></div>
  `,
  providers: [Page4Service, Page4State],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Page4Component implements OnInit, AfterViewInit, ComponentGuidelineUsingStore {
  constructor(
    private service: Page4Service,
    private state: Page4State,
    private cd: ChangeDetectorRef
  ) { }
  ngOnInit() {
    // c3のグラフを準備する。
    this.chart = c3.generate({
      bindto: '#chart',
      data: {
        columns: [
          ['diff_time'],
        ]
      },
      axis: { x: { type: 'category' } }
      // transition: { duration: 100 }
    });
    // -----
    this.service.disposeSubscriptionsBeforeRegister(); // registerSubscriptionsの前に、登録済みのsubscriptionを全て破棄する。
    this.registerSubscriptionsEveryActivate(); // ページ遷移入の度にsubscriptionを作成する。
  }
  ngAfterViewInit() {
    document.getElementById('keyinput').focus();
  }

  registerSubscriptionsEveryActivate() {
    let previousTime: number;
    let previousKeyCode: number;

    // 次回ページ遷移入時にunsubscribeするsubscription群。
    this.service.disposableSubscriptions = [
      // キーボード入力イベントをハンドリングする。Storeにデータを送る。
      Observable.fromEvent<KeyboardEvent>(document.getElementById('keyinput'), 'keyup')
        // .do(event => console.log(event))
        .do(event => { // keyAが押されると処理開始。          
          if (!this.proccessing && event.keyCode === 65 /* keyA */) {
            previousTime = this.startTimer();
            previousKeyCode = 64;
          }
        })
        .do(event => { // 処理中のキー入力イベントをハンドリングする。
          if (this.proccessing) {
            const keyCode = event.keyCode;
            if (keyCode - previousKeyCode !== 1) {
              alert('OOPS! TRY AGAIN.');
              this.stopTimer();
            } else {
              const now = lodash.now();
              const keyInput: KeyInput = {
                code: event['code'],
                keyCode: keyCode,
                uniqueId: this.uniqueId,
                diff: keyCode === 65 /* keyA */ ? 0 : now - previousTime
              };
              this.service.putKeyInput(keyInput).log('KeyInput'); // serviceを経由してStoreに値を送り、戻り値として得たStateをコンソールに出力する。
              previousTime = now;
              previousKeyCode = keyCode;
            }
          }
        })
        .do(event => { // keyZが押されると処理終了。
          if (this.proccessing && event.keyCode === 90 /* keyZ */) {
            this.stopTimer(true);
          }
        })
        .subscribe(() => this.cd.markForCheck()),

      // Storeからデータを受け取ってグラフを更新する。キーボード入力がトリガーとなりリアルタイムに更新される。
      this.state.keyInputs$
        .map(objs => objs.filter(obj => obj.uniqueId === this.uniqueId)) // 絞り込み
        .map(objs => objs.reverse()) // 降順を昇順に反転
        .do(objs => {
          if (objs.length > 0) {
            const diffs = objs.map(obj => obj.diff / 1000); // diffの単位をミリ秒から秒に変換。
            const letters = objs.map(obj => obj.code.charAt(3)); // ex)'KeyA'から'A'を取り出す。
            this.chart.load({ // c3のグラフを更新する。
              columns: [
                ['diff_time', ...diffs]
              ],
              categories: letters,
            });
          }
        })
        .subscribe(),
    ];
  }

  get title() { return this.state.title; }

  startTimer(): number {
    if (!this.proccessing) {
      console.log('Start Timer');
      this.proccessing = true;
      this.startTime = lodash.now();
      this.uniqueId = '' + this.startTime + lodash.uniqueId();
      this.endTime = null;
      this.textFinished = null;
    }
    return this.startTime;
  }

  stopTimer(valid?: boolean): void {
    if (this.proccessing) {
      console.log('Stop Timer');
      if (valid) {
        this.endTime = lodash.now();
        this.textFinished = this.text;
        this.textMissed = null;
        alert('COMPLETED! ' + this.result);
      } else {
        this.textMissed = this.text;
      }
      this.text = null;
      this.proccessing = false;
    }
  }

  get result() { return (this.startTime && this.endTime) ? '' + ((this.endTime - this.startTime) / 1000) + 's' : null; }

  set uniqueId(data: string) { this.service.putUniqueId(data).log('UniqueId'); }
  get uniqueId() { return this.state.uniqueId; }

  text: string;
  textFinished: string;
  textMissed: string;
  startTime: number;
  endTime: number;
  proccessing: boolean;
  chart: c3.ChartAPI;
}