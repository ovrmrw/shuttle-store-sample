import { AppComponent } from './app';
import { Store, StoreController } from '../shuttle-store';


/**
 *  ===== testing world =====
 */
import assert from "power-assert";
import {inject, async, TestComponentBuilder} from "angular2-testing-lite/core";
import {describe, it} from "angular2-testing-lite/mocha";


describe("Test: app.spec.ts", () => {
  it("can instantiate", async(() => {
    let store = new Store(null);
    assert(!!store);
  }));

  describe("---", () => {
    it("instanceof Store", async(() => {
      const sc = new StoreController(new Store(null));
      const store = sc.getStoreSafely();
      assert(store instanceof Store);
    }));

    it("store.key check", async(() => {
      const sc = new StoreController([new Store(null), new Store('second')]);
      const mainStore = sc.getStoreSafely();
      const secondStore = sc.getStoreSafely('second');
      assert(mainStore.key === '__main__');
      assert(secondStore.key === 'second');
    }));

    it('should fail', async(() => {
      assert('2' === '3');
    }));
  });
});