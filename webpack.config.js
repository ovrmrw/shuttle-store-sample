'use strict';

const webpack = require('webpack');

const atlQuery = { // stands for 'awesome-typescript-loader query'
  library: 'es2015', // = 'es6'
  useBabel: true,
  babelOptions: {
    presets: ['es2015'],
    plugins: []
  },
  useCache: true,
};


module.exports = [
  {
    entry: ['./src-front/boot.ts'],
    output: {
      path: 'bundles',
      filename: 'webpack.bundle.js'
    },
    resolve: {
      extensions: ['', '.ts', '.js']
    },
    plugins: [
      // new webpack.optimize.UglifyJsPlugin(), // minify enabled
      new webpack.NoErrorsPlugin(),
    ],
    module: {
      loaders: [
        {
          test: /\.ts$/,
          exclude: [/node_modules/, /typings/],
          // loader: 'babel-loader!ts-loader' // first ts-loader(with tsconfig.json), second babel-loader
          loader: 'awesome-typescript-loader', // babel-loader!ts-loader と同じようなもの 
          query: atlQuery
        },
        {
          test: /\.json$/,
          loader: "json-loader"
        },
        {
          test: /\.html$/,
          loader: "html-loader"
        }
      ]
    },
    devtool: 'source-map', // output source map
  }
]