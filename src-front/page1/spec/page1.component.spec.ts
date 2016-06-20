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


// オリジナルのfakeAsyncだとsetIntervalが元々走っているComponent(Service)をまともにテストできないので少し改造した。
import { fakeAsync, tick } from '../../../test';
// import { fakeAsync, tick, async } from '@angular/core/testing';


describe('Page1Component test ' + '-'.repeat(40), () => {
  let builder: TestComponentBuilder;
  let store: Store;
  let sc: StoreController;

  beforeEachProviders(() => [
    provide(Store, { useFactory: () => new Store(null /* main */, { devMode: true }) }),
    provide(StoreController, { useFactory: (store) => new StoreController(store), deps: [Store] }),
    Identifiers,
    // Page1Service,
    // Page1State,
  ]);


  beforeEach(inject([TestComponentBuilder, Store, StoreController], (tcb: TestComponentBuilder, _store, _storeController) => {
    builder = tcb;
    store = _store;
    sc = _storeController;
  }));


  iit('exist 0', (done) => {
    let titles: string[];
    (async () => {
      // await setTimeoutPromise(0);
      const fixture = await builder.createAsync(Page1Component) as ComponentFixture<Page1Component>;
      const component = fixture.componentRef.instance;
      const el = fixture.nativeElement as HTMLElement;
      await component.service.SC.getStoreSafely().readyForTest();

      component.state.titles$.subscribe(v => titles = v);
      await component.service.putTitle('a');
      fixture.detectChanges();
      await component.service.putTitle('ab');
      fixture.detectChanges();
      await component.service.putTitle('abc');
      fixture.detectChanges();
      console.log(titles);      
      expect(titles[0]).toBe('abc');
      expect(el.querySelector('h2#title').textContent).toEqual('abc - PAGE1');
      done();
    })();
  });


  it('exist', (done) => {
    // setTimeout(function () {
    (async () => {
      const mainStore = await sc.getStoreSafely().readyForTest();
      console.log(mainStore);
      // sc.storeNotificator$$.toPromise().then(() => console.log('ready'));
      // console.log('ready')
      await mainStore.put('test6', ['testing']);
      console.log(mainStore.takeLatest<string>(['testing']));
      expect(mainStore.takeLatest<string>(['testing'])).toBe('test');
      // assert(mainStore.takeLatest<string>(['testing']) === 'test');
      // done();
      // await setTimeoutPromise(0);
      done();
    })();
    // }, 1000);

    // mainStore.ready().then(store => {
    //   console.log('store is ready');
    // }).catch(err => console.log(err));
    // tick(5000);
    // assert(!!mainStore);
    // assert(mainStore.key === '__main__');
    // tick(2000);
    // mainStore.put('test1', ['testing']).then(l => {
    //   l.log('Test');
    //   // console.log('after put');
    //   // console.log(mainStore.takeLatest<string>(['testing']));
    // });
    // tick(5000);
    // console.log(mainStore.takeLatest<string>(['testing']));
  });

  it('exist2', fakeAsync(() => {
    // setTimeout(function () {
    // (async () => {
    let fixture: ComponentFixture<Page1Component>;
    builder.createAsync(Page1Component).then(f => fixture = f);
    tick();
    tick(5000);
    const component = fixture.componentRef.instance;
    // let mainStore: Store;
    component.service.putTitle('aaa');
    tick(1000);
    // console.log(mainStore);

    // sc.storeNotificator$$.toPromise().then(() => console.log('ready'));
    // console.log('ready')
    // mainStore.put('test4', ['testing']);
    // tick(1000);
    // console.log(mainStore.takeLatest<string>(['testing']));
    component.state.titles$.subscribe(titles => console.log(titles)).unsubscribe();
    tick(1000);
    // })();
    // }, 1000);

    // mainStore.ready().then(store => {
    //   console.log('store is ready');
    // }).catch(err => console.log(err));
    // tick(5000);
    // assert(!!mainStore);
    // assert(mainStore.key === '__main__');
    // tick(2000);
    // mainStore.put('test1', ['testing']).then(l => {
    //   l.log('Test');
    //   // console.log('after put');
    //   // console.log(mainStore.takeLatest<string>(['testing']));
    // });
    // tick(5000);
    // console.log(mainStore.takeLatest<string>(['testing']));
  }));


  // // setIntervalが検知されてasyncテストは不可。
  // it('can create', fakeAsync(() => {
  //   let fixture;
  //   builder.createAsync(Page1Component).then(f => fixture = f);
  //   tick();
  //   assert(!!fixture);
  // }));

  // iit('xxxx', fakeAsync(() => {
  //   let fixture: ComponentFixture<Page1Component>;
  //   builder.createAsync(Page1Component).then(f => fixture = f);
  //   tick();
  //   tick(5000);
  //   const component = fixture.componentRef.instance;
  //   let titles:string[];
  //   component.state.titles$.subscribe(v => titles = v);
  //   tick(100);
  //   component.service.putTitle('a');
  //   tick(10000);
  //   console.log(titles);
  // }))

});


