import { provide } from '@angular/core';
import { Page1Service, Page1State } from '../page1.service';
import { StoreController, Store } from '../../shuttle-store';
import { Identifiers, STORE_FORM, STORE_SECOND } from '../../services.ref';
declare var Zone: any;

/**
 *  ===== testing world =====
 */
import assert from 'power-assert';
import { describe, xdescribe, it, iit, async, expect, xit, beforeEach, beforeEachProviders, inject } from '@angular/core/testing';
import { fakeAsync, tick, setTimeoutPromise, observableValue } from '../../../test';


describe('Page1Service test ' + '-'.repeat(40), () => {
  let service: Page1Service;
  let state: Page1State;

  beforeEachProviders(() => [
    provide(Store, { useFactory: () => new Store(null /* main */, { devMode: false }) }),
    provide(StoreController, { useFactory: (store) => new StoreController(store), deps: [Store] }),
    Identifiers,
    Page1Service,
    Page1State,
  ]);


  beforeEach(inject([Page1Service, Page1State], (_service, _state) => {
    service = _service;
    state = _state;
  }));


  it('can create', async(() => {
    assert(!!service);
    assert(!!state);
  }));


  // このテストはfakeAsyncテストでは通らない。asyncテストでもsetTimeoutしないと通らない。
  // ServiceからsetInterval(Observable.timer)を取り除けばこんなややこしいことをしなくてもテストが通る。
  it('counter value must be increment correctly', () => {
    (async () => {
      // console.log(Zone.current._zoneDelegate._invokeZS);
      // await setTimeoutPromise(0, true); // setTimeoutしてzoneのfirst turnから抜けた状態じゃないと下記のテストは通らない。
      // await setTimeoutPromise(0, true);
      await setTimeoutPromise(1000, true);
      // console.log(Zone.current._zoneDelegate._invokeZS);
      // tick(5000);
      // service.SC.clearAllStatesAndAllStorages();
      // tick(1000);
      let titles: string[];
      state.titles$.subscribe(v => titles = v);
      await setTimeoutPromise(100);
      // tick(5000);
      console.log(titles);
      await service.putTitle('a')
      // tick(5000);
      await service.putTitle('ab')
      // tick(5000);
      await service.putTitle('abc')
      // tick();
      // tick(5000);
      await setTimeoutPromise(1000, true);
      console.log(titles);
      state.titles$.subscribe(v => console.log(v)).unsubscribe();
      // assert(titles == ['abc', 'ab']);
    })();
  });





  // it('fakeAsync test', fakeAsync(() => {
  //   let value = '';
  //   setTimeout(() => value = 'done', 1000);
  //   assert(value === '');
  //   tick(500);
  //   assert(value === '');
  //   console.log(value);
  //   tick(500);
  //   assert(value !== '');
  //   console.log(value);
  // }));
});
