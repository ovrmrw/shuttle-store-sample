import { provide } from '@angular/core';
import { Page1Component } from '../page1.component';
import { Page1Service, Page1State } from '../page1.service';
import { StoreController, Store } from '../../shuttle-store';
import { Identifiers, STORE_FORM, STORE_SECOND } from '../../services.ref';
declare var Zone: any;

/**
 *  ===== testing world =====
 */
import assert from 'power-assert';
import { describe, xdescribe, it, iit, xit, async, expect, beforeEach, beforeEachProviders, inject } from '@angular/core/testing';
import { TestComponentBuilder, ComponentFixture } from '@angular/compiler/testing';
import { elements, elementText, setTimeoutPromise } from '../../../test';
import lodash from 'lodash';


// オリジナルのfakeAsyncだとsetIntervalが元々走っているComponent(Service)をまともにテストできないので少し改造した。
import { fakeAsync, tick, observableValue } from '../../../test';
// import { fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';


describe('Page1Component test ' + '-'.repeat(40), () => {
  let builder: TestComponentBuilder;
  let store: Store;
  let sc: StoreController;

  beforeEachProviders(() => [
    provide(Store, { useFactory: () => new Store(null /* main */, { devMode: false }) }),
    provide(StoreController, { useFactory: (store) => new StoreController(store), deps: [Store] }),
    Identifiers,
    // Page1Service,
    // Page1State,
  ]);


  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    builder = tcb;
    // store = _store;
    // sc = _storeController;
  }));


  it('exist 0 working well', (done) => {
    let titles: string[];
    (async () => {
      const fixture = await builder.createAsync(Page1Component) as ComponentFixture<Page1Component>;
      const component = fixture.componentRef.instance;
      const el = fixture.nativeElement as HTMLElement;
      await component.service.SC.readyForTestAllStores();

      component.state.titles$.subscribe(values => titles = values);
      await component.service.putTitle('a');
      await component.service.putTitle('ab');
      await component.service.putTitle('abc');
      
      fixture.detectChanges();
      assert.deepEqual(titles, ['abc', 'ab', 'a']);
      assert(el.querySelector('h2#title').textContent === 'abc - PAGE1');
      done();
    })().catch(e => done.fail(e));
  });


  it('colors', (done) => {
    let colors: string[];
    let time: number;
    (async () => {
      const fixture = await builder.createAsync(Page1Component) as ComponentFixture<Page1Component>;
      const component = fixture.componentRef.instance;
      const el = fixture.nativeElement as HTMLElement;
      await component.service.SC.readyForTestAllStores();

      component.state.colorsReplayStream$$.subscribe(values => colors = values);
      await component.service.putColor('pink');
      await component.service.putColor('green');
      await component.service.putColor('yellow');

      await setTimeoutPromise(300);
      console.log(colors);
      assert.deepEqual(colors, ['pink', 'green', 'yellow']);
      done();
    })().catch(e => done.fail(e));
  });

});


