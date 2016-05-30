const webpack = require("webpack");

module.exports = [
  {
    entry: ['./src-front/boot.ts'],
    output: {
      filename: './bundles/webpack.bundle.js'
    },
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
          exclude: [/node_modules/],
          loader: 'babel-loader!ts-loader' // first ts-loader(with tsconfig.json), second babel-loader        
        },
        {
          test: /\.json$/,
          loader: "json-loader"
        }
      ]
    },
    devtool: 'source-map', // output source map
  }
]