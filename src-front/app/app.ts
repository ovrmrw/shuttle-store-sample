import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Route, RouteConfig, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { Page1Component } from '../page1/page1.component';
import { Page2Component } from '../page2/page2.component';
import { Page3Component } from '../page3/page3.component';
import { Page4Component } from '../page4/page4.component';
import { Store } from '../shuttle-store';

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
      </ul>
    </nav>
    <router-outlet></router-outlet>
  `,
  directives: [ROUTER_DIRECTIVES],
  providers: [Store],
  changeDetection: ChangeDetectionStrategy.Default
})
@RouteConfig([
  new Route({ path: 'p1', component: Page1Component, name: 'Page1', useAsDefault: true }),
  new Route({ path: 'p2', component: Page2Component, name: 'Page2' }),
  new Route({ path: 'p3', component: Page3Component, name: 'Page3' }),
  new Route({ path: 'p4', component: Page4Component, name: 'Page4' }),
])
export class AppComponent { }