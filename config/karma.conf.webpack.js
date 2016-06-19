'use strict';
// Karma configuration
// Generated on Fri Mar 25 2016 00:06:13 GMT+0900 (JST)

module.exports = function (config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      './test/unittest.boot.ts'
    ],


    // list of files to exclude
    exclude: [],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      './test/unittest.boot.ts': ['webpack', 'sourcemap']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'], // PhantomJS / Firefox / Chrome


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,


    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,


    mochaReporter: {
      // colors: {
      //   success: 'white'
      // },
      output: 'autowatch',
      divider: '/'
    },


    webpack: {
      // entry: ['./test/unittest.boot.ts'],
      // output: {
      //   filename: './bundles/webpack.bundle.spec.espowered.js'
      // },
      resolve: {
        extensions: ['', '.ts', '.js']
      },
      plugins: [
        // new webpack.optimize.UglifyJsPlugin() // minify enabled
      ],
      module: {
        loaders: [
          {
            test: /\.ts$/,
            exclude: [/node_modules/, /typings/],
            // loader: 'babel-loader?presets[]=es2015&plugins[]=babel-plugin-espower!ts-loader', // babel-loaderがbabel-plugin-espowerを読み込む必要がある。
            loader: 'awesome-typescript-loader', // babel-loader!ts-loader と同じようなもの
            query: { // stands for 'awesome-typescript-loader query'
              library: 'es2015', // = 'es6'
              useBabel: true,
              babelOptions: {
                presets: ['es2015'],
                plugins: ['babel-plugin-espower']
              },
              useCache: true,
            }
          },
          {
            test: /\.json$/,
            loader: "json-loader"
          },
          {
            test: /\.html$/,
            loader: 'html-loader'
          }
        ]
      },
      devtool: 'inline-source-map',
    },


    webpackMiddleware: {
      stats: 'errors-only',
    },


    // restartOnFileChange: true,
  })
}