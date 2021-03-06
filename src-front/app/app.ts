import { Component, ChangeDetectionStrategy, OnInit, provide } from '@angular/core';
import { Route, RouteConfig, ROUTER_DIRECTIVES } from '@angular/router-deprecated';

import { Store, StoreController } from '../shuttle-store';
import { STORE_SECOND, STORE_FORM, Identifiers } from './app.service';
import { Page1Component } from '../page1/page1.component';
import { Page2Component } from '../page2/page2.component';
import { Page3Component } from '../page3/page3.component';
import { Page4Component } from '../page4/page4.component';
import { Page5Component } from '../page5/page5.component';
import { Page6Component } from '../page6/page6.component';
import { Page7Component } from '../page7/page7.component';


///////////////////////////////////////////////////////////////////////////////////
// Top Component
@Component({
  selector: 'sg-app',
  template: `
    <nav>
      <ul>
        <li><a [routerLink]="['/Page1']">Page1</a></li>
        <li><a [routerLink]="['/Page2']">Page2</a></li>
        <li><a [routerLink]="['/Page3']">Page3</a></li>
        <li><a [routerLink]="['/Page4']">Page4</a></li>
        <li><a [routerLink]="['/Page5']">Page5</a></li>
        <li><a [routerLink]="['/Page6']">Page6</a></li>
        <li><a [routerLink]="['/Page7']">Page7</a></li>
      </ul>
    </nav>
    <router-outlet></router-outlet>
  `,
  directives: [ROUTER_DIRECTIVES],
  providers: [
    provide(Store, { useFactory: () => new Store(null /* main */, { autoRefresh: true, devMode: true, useToastr: true }), multi: true }),
    provide(Store, { useFactory: () => new Store(STORE_SECOND, { autoRefresh: true, devMode: true, useToastr: true }), multi: true }),
    provide(Store, { useFactory: () => new Store(STORE_FORM, { autoRefresh: false, devMode: true, useToastr: true }), multi: true }),
    provide(StoreController, { useFactory: (store) => new StoreController(store), deps: [Store] }),
    Identifiers,
  ],
  changeDetection: ChangeDetectionStrategy.Default
})
@RouteConfig([
  new Route({ path: 'p1', component: Page1Component, name: 'Page1', useAsDefault: true }),
  new Route({ path: 'p2', component: Page2Component, name: 'Page2' }),
  new Route({ path: 'p3', component: Page3Component, name: 'Page3' }),
  new Route({ path: 'p4', component: Page4Component, name: 'Page4' }),
  new Route({ path: 'p5', component: Page5Component, name: 'Page5' }),
  new Route({ path: 'p6', component: Page6Component, name: 'Page6' }),
  new Route({ path: 'p7', component: Page7Component, name: 'Page7' }),
])
export class AppComponent { }