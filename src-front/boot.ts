/////////////////////////////////////////////////////////////////////////////
// Entry Point
import 'zone.js/dist/zone';
import { provide, enableProdMode } from '@angular/core';
import { ROUTER_PROVIDERS } from '@angular/router-deprecated';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { HTTP_PROVIDERS, JSONP_PROVIDERS } from '@angular/http';
import { bootstrap } from '@angular/platform-browser-dynamic';
import { AppComponent } from './app/app';

enableProdMode();
bootstrap(AppComponent, [
  HTTP_PROVIDERS,
  JSONP_PROVIDERS,
  ROUTER_PROVIDERS,
  provide(LocationStrategy, { useClass: HashLocationStrategy })
]);