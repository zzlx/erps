/**
 * *****************************************************************************
 * -----------------------------------------------------------------------------
 *
 * webpack配置
 *
 * 用于生成前端代码
 *
 * @file: config.webpack.cjs
 * -----------------------------------------------------------------------------
 * *****************************************************************************
 */

// internal modules
const fs = require('fs');
const path = require('path');

// third-part modules
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');

module.exports = (opts = {}) => {
	const APP_PATH = opts.dir || path.dirname(__dirname);
  process.env.NODE_ENV = opts.env || process.env.NODE_ENV || 'production';
  const isDevel = 'development' === process.env.NODE_ENV;
  const isProd  = 'production' === process.env.NODE_ENV;

  const paths = {
    appPath: APP_PATH,
    appDist: path.join(APP_PATH, 'dist'),
    appPublic: path.join(APP_PATH, 'public'),
    publicPath: '/',
    publicUrl: '/',
  };

  return {
    mode: isDevel ? 'development' : isProd ? 'production' : 'none',
    bail: isProd,
    devtool: isProd ? 'source-map' : isDevel ? 'inline-source-map' : false,
    node: false,
    target: opts.target ? opts.target : 'web',

    entry: {
      main: path.join(paths.appPath, 'src', 'clients', 'DOMRender.mjs'),
      styles: path.join(paths.appPath, 'src', 'styles', 'index.scss'),
    },

    output: {
      path: paths.appDist,
      pathinfo: isDevel,
      filename: 'static/js/[name].[contenthash:8].bundle.js',
      chunkFilename: 'static/js/[name].[contenthash:8].chunk.js',
      futureEmitAssets: true,
      publicPath: paths.publicPath,
    },

    module: {
      strictExportPresence: true,
      rules: [
        { parser: { requireEnsure: false } },
        {
          oneOf: [
            { test: /\.(mjs|js)$/, 
							exclude: /node_modules/,
							loader: 'babel-loader', 
							options: {
								presets: [ "react-app" ]
							}
						},
            { test: /\.gql$/, loader: 'raw-loader', },
            { test: /\.(md|txt)$/, 
              loader: 'file-loader', 
              options: {
                name: 'doc/[name].[contenthash:8].[ext]',
              }
            },
            { test: /\.(scss|sass|css)$/,
              use: [
                isProd ? 
                { loader: MiniCssExtractPlugin.loader,
                  options: { hmr: isDevel, reloadAll: true, },
                } :
                { loader: 'style-loader' },
                { loader: 'css-loader' },
                { loader: 'postcss-loader',
                  options: {
                    plugins: () => [ 'autoprefixer' ],
                  }
                },
                { loader: 'sass-loader' },
              ],
            },
            { test: /\.(png|svg|jpg|gif|jpeg|bmp)$/, 
              loader: 'url-loader',
              options: {
                limit: 1024 * 10, // 10kb
                name: 'static/media/[name].[contenthash:8].[ext]',
                mimetype: 'image/[ext]',
              },
            },
            { loader: 'file-loader',
              exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
              options: {
                name: 'static/other/[name].[contenthash:8].[ext]',
              },
            }
          ],
        },
      ],
    },

    plugins: [
      new webpack.ProgressPlugin(), // 显示打包进度
      new CleanWebpackPlugin({
        dry: isDevel ? true : false,
        verbose: isDevel ? true : false,
        cleanStaleWebpackAssets: true,
        protectWebpackAssets: false,
      }),
      new CopyPlugin([
        { 
          from: paths.appPublic, 
          to: paths.appDist, 
          ignore: ['index.html'], 
          force: true, 
          cache: true, 
        },
      ]),
      new webpack.EnvironmentPlugin({ NODE_ENV: 'production', }),
      new webpack.DefinePlugin({
        //'PUBLIC_URL': JSON.stringify(process.env.NODE_ENV),
      }),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        title: 'App|Home',
        template: path.join(paths.appPublic, 'index.html'),
        templateParameters: {
          'PUBLIC_URL': '/',
        },
        inject: true,
        /*
         *
         * <link rel="apple-touch-icon" href="/static/images/favicons/apple-touch-icon.png" sizes="180x180">
  <link rel="icon" href="/static/images/favicons/favicon-32x32.png" sizes="32x32" type="image/png">
  <link rel="icon" href="/static/images/favicons/favicon-16x16.png" sizes="16x16" type="image/png">
  <link rel="manifest" href="/static/images/favicons/manifest.json">
  <link rel="mask-icon" href="/static/images/favicons/safari-pinned-tab.svg" color="#43853d">
  <link rel="shortcut icon" href="/static/images/favicons/favicon.ico">

         */
        favicon: path.join(paths.appPublic, 'favicon.ico'),
        meta: { 
          keywords: '',
          charset: 'utf-8',
          description: '',
          viewport: 'width=device-width,initial-scale=1,shrink-to-fit=no',
        },
        minify: {
          removeComments: isProd,
          collapseWhitespace: isProd,
          removeRedundantAttributes: isProd,
          useShortDoctype: isProd,
          removeEmptyAttributes: isProd,
          removeStyleLinkTypeAttributes: isProd,
          keepClosingSlash: isProd,
          minifyJS: isProd,
          minifyCSS: isProd,
          minifyURLs: isProd,
        },
      }),

      new webpack.HashedModuleIdsPlugin({
        hashFunction: 'sha1',
        hashDigest: 'hex',
        //hashDigestLength: 20
      }),

      isProd && new MiniCssExtractPlugin({
        filename: 'static/css/[name].[contenthash].css',
        chunkFilename: 'static/css/[name].[contenthash].chunk.css',
        ignoreOrder: false,
      }),

      isProd && new CompressionPlugin({
        test: /\.(js|css|html|svg)$/,
        algorithm: 'brotliCompress', // gzip
        threshold: 1024 * 100, // 100kb
        minRatio: 0.8,
        deleteOriginalAssets: false,
        filename(info) {
          return `${info.path}.br${info.query}`;
        },
      }),
    ].filter(Boolean),

    optimization: {
      moduleIds: 'hashed',
      runtimeChunk: 'single',
      splitChunks: { 
        chunks: 'all',
        maxInitialRequests: Number.POSITIVE_INFINITY,
        minSize: 0,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: (module) => {
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              return `${packageName.replace('@', '')}`;
            },
          },
        },
      },

      minimize: isProd ? true : false,
      minimizer: [
        new TerserJSPlugin({
          cache: true,
          parallel: true,
          sourceMap: isProd ? true : false,
          terserOptions: {
            parse: { ecma: 8, },
            compress: {
              ecma: 5,
              warnings: false,
              comparisons: false,
              inline: 2,
            },
            mangle: { safari10: true, },
            output: {
              ecma: 5,
              comments: false,
              ascii_only: true,
            },
          },
        }), 
      ],
    },

    performance: {
      hints: isProd ? "warning" : isDevel ? false : 'error',
      assetFilter: (assetFilename) => assetFilename.endsWith('.js'),
    },

    node: {
      fs: 'empty',
      os: 'empty',
      path: 'empty',
    },

    watchOptions: {
      aggregateTimeout: 300, // 300ms
      poll: 1000, // 1000ms
      ignored: [
        'node_modules', 
        'src/graphql', 
        'src/resolvers', 
        'src/schema', 
        'src/services', 
      ],
    },
  };
}
