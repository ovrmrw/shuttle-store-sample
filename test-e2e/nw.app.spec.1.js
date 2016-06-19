'use strict';

var maxWait = 5000;

module.exports = {
  'Nightwatch test 1': function (browser) {
    browser
      .url('http://localhost:5000')

      .waitForElementPresent('body', maxWait)
      .assert.title('ExpressApp')

      .end();
  }
};
