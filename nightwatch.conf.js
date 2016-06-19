'use strict';

const jar = require('selenium-server-standalone-jar');
const phantomjs = require('phantomjs-prebuilt');
const chromedriver = require('chromedriver');


// phantomjsだとsetInterval等でDOMが更新されているとエラーになるので仕方なくfirefoxかchromeを使う。
// const browserName = 'firefox'; // ver47はなぜかエラーになる。
const browserName = 'chrome';
// const browserName = '';

module.exports = (function (settings) {
  settings.selenium.server_path = jar.path;
  settings.selenium.cli_args['webdriver.chrome.driver'] = chromedriver.path;
  settings.test_settings.default.desiredCapabilities['phantomjs.binary.path'] = phantomjs.path;
  if (browserName) {
    settings.test_settings.default.desiredCapabilities['browserName'] = browserName;
  }
  return settings;
})(require('./config/nightwatch.json'));
