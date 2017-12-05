const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const entryPointsPathPrefix = 'src';
module.exports = {
  entry: {
    'materialize-strict': path.resolve(__dirname, entryPointsPathPrefix, 'index.ts')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: 'materializeStrict'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  externals: {
    'cash-dom': '$',
    'animejs': 'anime'
  },
  module: {
    loaders: [
      {
        test: /\.ts$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'ts-loader'
        }
      }, {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['babel-preset-env']
          }
        }
      }, {
        test: /\.scss$/,
        exclude: /(node_modules|bower_components)/,
        use: ExtractTextPlugin.extract([
          {
            loader: 'css-loader',
            options: {
              minimize: true,
              sourceMap: true
            }
          },
          {loader: 'autoprefixer-loader', options: {browsers: ['last 2 version']}},
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
              sourceMapContents: true
            }
          }
        ])
      }, {
        test: /\.(html)$/,
        use: {
          loader: 'html-loader'
        }
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false,
        drop_console: false
      }
    }),
    new ExtractTextPlugin('materialize-strict.css'),
    new CleanWebpackPlugin(['dist'])
  ],
  devtool: 'source-map'
};
