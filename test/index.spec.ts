// es6 shim
import "core-js/shim";

// ng2 deps
import "zone.js/dist/zone";
import "zone.js/dist/long-stack-trace-zone";
import "zone.js/dist/async-test";
import 'rxjs/Rx';

import {
  setBaseTestProviders,
  resetBaseTestProviders,
} from "angular2-testing-lite/core";

import {
  BROWSER_APP_DYNAMIC_PROVIDERS
} from "@angular/platform-browser-dynamic";

import {
  TEST_BROWSER_STATIC_PLATFORM_PROVIDERS,
  ADDITIONAL_TEST_BROWSER_PROVIDERS,
} from "@angular/platform-browser/testing/browser_static";


import '../src-front/app/app.spec';


resetBaseTestProviders();
setBaseTestProviders(TEST_BROWSER_STATIC_PLATFORM_PROVIDERS, [
  BROWSER_APP_DYNAMIC_PROVIDERS,
  ADDITIONAL_TEST_BROWSER_PROVIDERS
]);