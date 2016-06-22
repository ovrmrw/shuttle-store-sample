import { provide } from '@angular/core';
import { Page2Service, Page2State } from '../page2.service';
import { Store, StoreController } from '../../shuttle-store';
import { Identifiers, STORE_SECOND, STORE_FORM, Page1Service } from '../../services.ref';


/**
 *  ===== testing world =====
 */
import assert from 'power-assert';
import lodash from 'lodash';
import { describe, xdescribe, it, iit, async, expect, xit, beforeEach, beforeEachProviders, inject } from '@angular/core/testing';
import { asyncPower, setTimeoutPromise, observableValue } from '../../../test';


describe('Page2Service TEST ' + '-'.repeat(40), () => {
  let page1Service: Page1Service;
  let service: Page2Service;
  let state: Page2State;
  let storeController: StoreController;

  beforeEachProviders(() => [
    provide(Store, { useFactory: () => new Store(null /* main */, { devMode: false }), multi: true }),
    provide(Store, { useFactory: () => new Store(STORE_SECOND, { devMode: false }), multi: true }),
    provide(Store, { useFactory: () => new Store(STORE_FORM, { devMode: false }), multi: true }),
    provide(StoreController, { useFactory: (store) => new StoreController(store), deps: [Store] }),
    Identifiers,
    Page1Service,
    Page2Service,
    Page2State
  ]);


  beforeEach(inject([Page1Service, Page2Service, Page2State, StoreController], (_page1Service, _service, _state, _storeController) => {
    page1Service = _page1Service;
    service = _service;
    state = _state;
    storeController = _storeController;
  }));


  it('can create', asyncPower(async () => {
    assert(!!service);
    assert(!!state);
  }));


  it('state.title', asyncPower(async () => {
    await storeController.readyForTestAllStores();
    await page1Service.putTitle('a');
    assert(state.title === 'a');
    await page1Service.putTitle('ab');
    assert(state.title === 'ab');
    await page1Service.putTitle('abc');
    assert(state.title === 'abc');
  }));


  it('state.titles$', asyncPower(async () => {
    let titlesList: string[][] = [];

    await storeController.readyForTestAllStores();
    state.titles$.subscribe(values => titlesList.push(values));
    page1Service.putTitle('a');
    page1Service.putTitle('ab');
    await page1Service.putTitle('abc');

    console.log(titlesList);
    assert.deepEqual(titlesList[titlesList.length - 1], ['abc', 'ab', 'a']);
  }));


  it('state.titleReplayStream$$', asyncPower(async () => {
    let titleList: string[] = [];

    await storeController.readyForTestAllStores();
    state.titleReplayStream$$.subscribe(value => titleList.push(value));
    page1Service.putTitle('a');
    page1Service.putTitle('ab');
    page1Service.putTitle('abc');
    await setTimeoutPromise(100);

    console.log(titleList);
    assert.deepEqual(titleList, ['a', 'ab', 'abc']);
  }));


  it('state.titleReplayStreamDesc$$', asyncPower(async () => {
    let titleList: string[] = [];

    await storeController.readyForTestAllStores();
    state.titleReplayStreamDesc$$.subscribe(value => titleList.push(value));
    page1Service.putTitle('a');
    page1Service.putTitle('ab');
    page1Service.putTitle('abc');
    await setTimeoutPromise(100);

    console.log(titleList);
    assert.deepEqual(titleList, ['abc', 'ab', 'a']);
  }));


  it('state.colorsReplayStream$$', asyncPower(async () => {
    let colorsList: string[][] = [];

    await storeController.readyForTestAllStores();
    state.colorsReplayStream$$.subscribe(values => colorsList.push(values));
    page1Service.putColor('pink');
    page1Service.putColor('green');
    await page1Service.putColor('blue');
    await setTimeoutPromise(100);

    console.log(colorsList);
    assert.deepEqual(colorsList[colorsList.length - 1], ['pink', 'green', 'blue']);
  }));


  it('state.colorsReplayStreamDesc$$', asyncPower(async () => {
    let colorsList: string[][] = [];

    await storeController.readyForTestAllStores();
    state.colorsReplayStreamDesc$$.subscribe(values => colorsList.push(values));
    page1Service.putColor('pink');
    page1Service.putColor('green');
    await page1Service.putColor('blue');
    await setTimeoutPromise(100);

    console.log(colorsList);
    assert.deepEqual(colorsList[colorsList.length - 1], ['blue', 'green', 'pink']);
  }));



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
