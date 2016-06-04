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
    <p>This is a well-known typical Increment/Decrement sample with persisting data and Undo/Redo.</p>
    <p>You can handle the counter correctly even if you straddle multi browser tab pages.</p>
    <hr />
    <h2>{{_$counter}}</h2>
    <button (click)="increment()">+</button>
    <button (click)="decrement()">-</button>
    <hr />
    <button (click)="rollback()">Undo</button>
    <button (click)="revertRollback()">Redo</button>
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
    this.service.SC.initializeWatchingSubscriptionsBeforeRegisterOnInit(this.cd);
    this.registerWatchingSubscriptionsAfterInitializeOnInit();
  }


  registerWatchingSubscriptionsAfterInitializeOnInit() {
    this.service.SC.disposableSubscriptions = [
      this.state.counter$
        .map(counter => counter ? counter : 0)
        .do(counter => this._$counter = counter)
        .subscribe(),
    ];
  }


  increment() {
    this.service.putCounter(this._$counter + 1).then(x => x.log('increment'));
  }

  decrement() {
    this.service.putCounter(this._$counter - 1).then(x => x.log('decrement'));
  }


  rollback() {
    this.service.SC.rollback();
  }

  revertRollback() {
    this.service.SC.revertRollback();
  }


  get title() { return this.state.title; }


  private _$counter: number;
}