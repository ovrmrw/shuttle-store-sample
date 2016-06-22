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
import lodash from 'lodash';


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


  it('can create', (done) => {
    (async () => {
      assert(!!service);
      assert(!!state);
      done();
    })().catch(e => done.fail(e));
  });


  // このテストはfakeAsyncテストでは通らない。asyncテストでもsetTimeoutしないと通らない。
  // ServiceからsetInterval(Observable.timer)を取り除けばこんなややこしいことをしなくてもテストが通る。
  it('titles', (done) => {
    let titles: string[] = [];
    (async () => {
      await service.SC.readyForTestAllStores();
      state.titles$.subscribe(values => titles = values);
      await service.putTitle('a');
      await service.putTitle('ab');
      await service.putTitle('abc');

      assert.deepEqual(titles, ['abc', 'ab', 'a']);
      done();
    })().catch(e => done.fail(e));
  });


  it('colors', (done) => {
    let colors: string[] = [];
    (async () => {
      await service.SC.readyForTestAllStores();
      state.colorsReplayStream$$.subscribe(values => colors = values);
      await service.putColor('pink');
      await service.putColor('green');
      await service.putColor('blue');

      assert.deepEqual(colors, []);
      await setTimeoutPromise(300); // { interval: 100 }にしているので大体200～300ms程度のwaitが必要。
      assert.deepEqual(colors, ['pink', 'green', 'blue']);
      done();
    })().catch(e => done.fail(e));
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
