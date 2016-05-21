import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Route, RouteConfig, ROUTER_DIRECTIVES } from '@angular/router-deprecated';
import { Page1Component } from '../page1/page1.component';
import { Page2Component } from '../page2/page2.component';
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
])
export class AppComponent { }