'use strict';

const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const DataHub = require('macaca-datahub');
const datahubMiddleware = require('datahub-proxy-middleware');

const datahubConfig = {
  port: 5678,
  hostname: '127.0.0.1',
  store: path.join(__dirname, 'data'),
  proxy: {
    '^/api': {
      hub: 'todo',
    },
  },
  showBoard: true,
};

const defaultDatahub = new DataHub({
  port: datahubConfig.port,
});

const config = {
  entry: {
    'src': path.resolve('src'),
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: 'dist',
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }, {
        test: /\.vue$/,
        loader: 'vue-loader',
        exclude: /node_modules/,
        options: {
          esModule: true,
          loaders: {
            ts: [
              'babel-loader',
              {
                loader: 'ts-loader',
                options: {
                  appendTsSuffixTo: [/\.vue$/],
                  configFile: path.resolve(__dirname, 'tsconfig.json')
                }
              }
            ]
          }
        }
      }, {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          'babel-loader',
          {
            loader: 'ts-loader',
            options: {
              appendTsSuffixTo: [/\.vue$/],
              configFile: path.resolve(__dirname, 'tsconfig.json')
            }
          },
          'tslint-loader'
        ]
      }, {
        test: /\.json$/,
        loader: 'json-loader',
        type: 'javascript/auto',
        exclude: /node_modules/
      }, {
        test: /\.less$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'less-loader'
          },
          {
            loader: 'postcss-loader'
          }
        ]
      }, {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.json'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  plugins: [
    new VueLoaderPlugin()
  ],
  devServer: {
    before: app => {
      datahubMiddleware(app)(datahubConfig);
    },
    after: () => {
      defaultDatahub.startServer(datahubConfig)
        .then(() => {});
    }
  }
};

module.exports = config;
