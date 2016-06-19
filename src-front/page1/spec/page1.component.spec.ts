import { provide } from '@angular/core';
import { Page1Component } from '../page1.component';
import { Page1Service, Page1State } from '../page1.service';
import { StoreController, Store } from '../../shuttle-store';
import { Identifiers, STORE_FORM, STORE_SECOND } from '../../services.ref';


/**
 *  ===== testing world =====
 */
import assert from 'power-assert';
import { describe, xdescribe, it, iit, xit, async, expect, beforeEach, beforeEachProviders, inject } from '@angular/core/testing';
import { TestComponentBuilder, ComponentFixture } from '@angular/compiler/testing';
import { elements, elementText } from '../../../test';


// オリジナルのfakeAsyncだとsetIntervalが元々走っているComponent(Service)をまともにテストできないので少し改造した。
import { fakeAsync, tick } from '../../../test';


describe('Page1Component test ' + '-'.repeat(40), () => {
  let builder: TestComponentBuilder;

  beforeEachProviders(() => [
    provide(Store, { useFactory: () => new Store(null /* main */, { devMode: false }) }),
    provide(StoreController, { useFactory: (store) => new StoreController(store), deps: [Store] }),
    Identifiers,
    Page1Service,
    Page1State,
  ]);


  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    builder = tcb;
  }));


  // setIntervalが検知されてasyncテストは不可。
  it('can create', fakeAsync(() => {
    let fixture;
    builder.createAsync(Page1Component).then(f => fixture = f);
    tick();
    assert(!!fixture);
  }));

  iit('xxxx', fakeAsync(() => {
    let fixture: ComponentFixture<Page1Component>;
    builder.createAsync(Page1Component).then(f => fixture = f);
    tick();
    tick(5000);
    const component = fixture.componentRef.instance;
    let titles:string[];
    component.state.titles$.subscribe(v => titles = v);
    tick(100);
    component.service.putTitle('a');
    tick(10000);
    console.log(titles);
  }))

});


