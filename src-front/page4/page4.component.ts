import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, AfterViewInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import c3 from 'c3';
import lodash from 'lodash';
import toastr from 'toastr';

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
    <div>「Start True-time Replay」をクリックして始まるリプレイは"実時間を再現した"リプレイです。</div>
    <hr />
    <div>Input A～Z: <input type="text" [(ngModel)]="text" id="keyinput" /></div>
    <div *ngIf="textFinished">Finished: {{textFinished}}</div>
    <div *ngIf="textMissed">Missed: {{textMissed}}</div>
    <hr />
    <div>Start: {{startTime}}</div>
    <div>End: {{endTime}}</div>
    <div>Result: {{result}}</div>
    <div id="chart"></div>
    <hr />
    <div><button (click)="startTruetimeReplay()">Start True-time Replay</button></div>
    <div id="chartreplay"></div>    
    <hr />
    <div><button (click)="clearState()">Clear State</button></div>
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
    // リプレイ用のc3のグラフを準備する。
    this.chartReplay = c3.generate({
      bindto: '#chartreplay',
      data: { columns: [['diff_time']] },
      axis: { x: { type: 'category' } },
    });


    this.service.SC.initializeWatchingSubscriptionsBeforeRegisterOnInit(this.cd); // 登録済みの変更監視Subscriptionを全て破棄する。
    this.registerWatchingSubscriptionsAfterInitializeOnInit(); // ページ遷移入の度に変更監視Subscriptionを登録する。
  }

  ngAfterViewInit() {
    document.getElementById('keyinput').focus();
  }


  registerWatchingSubscriptionsAfterInitializeOnInit() {
    let previousTime: number;
    let previousKeyCode: number;

    // 次回ページ遷移入時にunsubscribeするsubscription群。
    this.service.SC.disposableSubscriptions = [
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
              toastr.error('OOPS! TRY AGAIN.'); // alert('OOPS! TRY AGAIN.');
              this.stopTimer();
            } else {
              const now = lodash.now();
              const keyInput: KeyInput = {
                code: event['code'],
                keyCode: keyCode,
                filterId: this.filterId,
                diff: keyCode === 65 /* keyA */ ? 0 : now - previousTime
              };
              this.service.putKeyInput(keyInput).then(x => x.log('KeyInput')); // serviceを経由してStoreに値を送り、戻り値として得たStateをコンソールに出力する。
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
        .map(objs => objs.reverse()) // 降順を昇順に反転
        .do(objs => {
          if (objs.filter(obj => 'diff' in obj && 'code' in obj).length > 0) {
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


  startTimer(): number {
    if (!this.proccessing) {
      console.log('Start Timer');
      this.proccessing = true;
      this.startTime = lodash.now();
      this.filterId = '' + this.startTime + lodash.uniqueId();
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
        toastr.success('COMPLETED! ' + this.result + '\nLet\'s watch True-time Replay.'); // alert('COMPLETED! ' + this.result + "\nLet's watch True-time Replay.");
        this.startTruetimeReplay();
      } else {
        this.textMissed = this.text;
      }
      this.text = null;
      this.proccessing = false;
    }
  }


  startTruetimeReplay() {
    this.service.SC.disposableSubscription = this.state.keyInputsReplayStream$$
      .do(objs => {
        if (objs.filter(obj => 'diff' in obj && 'code' in obj).length > 0) {
          const diffs = objs.map(obj => obj.diff / 1000); // diffの単位をミリ秒から秒に変換。
          const letters = objs.map(obj => obj.code.charAt(3)); // ex)'KeyA'から'A'を取り出す。
          this.chartReplay.load({ // c3のグラフを更新する。
            columns: [
              ['diff_time', ...diffs]
            ],
            categories: letters,
          });
        }
      })
      .subscribe(() => this.cd.markForCheck());
  }


  clearState() {
    this.service.SC.clearAllStatesAndAllStorages();
  }


  get title() { return this.state.title; }

  get result() { return (this.startTime && this.endTime) ? '' + ((this.endTime - this.startTime) / 1000) + 's' : null; }


  text: string;
  textFinished: string;
  textMissed: string;
  startTime: number;
  endTime: number;
  filterId: string;
  proccessing: boolean;
  chart: c3.ChartAPI;
  chartReplay: c3.ChartAPI;
}