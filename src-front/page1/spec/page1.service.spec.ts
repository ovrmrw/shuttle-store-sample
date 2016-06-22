import { provide } from '@angular/core';
import { Page1Service, Page1State } from '../page1.service';
import { Store, StoreController } from '../../shuttle-store';
import { Identifiers, STORE_FORM, STORE_SECOND } from '../../services.ref';


/**
 *  ===== testing world =====
 */
import assert from 'power-assert';
import lodash from 'lodash';
import { describe, xdescribe, it, iit, async, expect, xit, beforeEach, beforeEachProviders, inject } from '@angular/core/testing';
import { fakeAsync, tick, asyncPower, setTimeoutPromise, observableValue } from '../../../test';
declare var jasmine: any;


describe('Page1Service test ' + '-'.repeat(40), () => {
  let service: Page1Service;
  let state: Page1State;

  beforeEachProviders(() => [
    provide(Store, { useFactory: () => new Store(null /* main */, { devMode: false }) }),
    provide(StoreController, { useFactory: (store) => new StoreController(store), deps: [Store] }),
    Identifiers,
    Page1Service,
    Page1State
  ]);


  beforeEach(inject([Page1Service, Page1State], (_service, _state) => {
    service = _service;
    state = _state;
  }));


  it('can create', asyncPower(async () => {
    assert(!!service);
    assert(!!state);
  }));


  it('titles', asyncPower(async () => {
    let titlesList: string[][] = [];

    await service.SC.readyForTestAllStores();
    state.titles$.subscribe(values => titlesList.push(values));
    await service.putTitle('a');
    await service.putTitle('ab');
    await service.putTitle('abc');

    console.log(titlesList);
    assert.deepEqual(titlesList[titlesList.length - 1], ['abc', 'ab', 'a']);
  }));


  it('colors', asyncPower(async () => {
    let colorsList: string[][] = [];

    await service.SC.readyForTestAllStores();
    state.colorsReplayStream$$.subscribe(values => colorsList.push(values));
    await service.putColor('pink');
    await service.putColor('green');
    await service.putColor('blue');

    // assert.deepEqual(colors, [null]);    
    await setTimeoutPromise(300); // { interval: 100 }にしているので大体200～300ms程度のwaitが必要。
    console.log(colorsList);
    assert.deepEqual(colorsList[colorsList.length - 1], ['pink', 'green', 'blue']);
  }));

});
