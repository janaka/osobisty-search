const path = require('path');
const fs = require("fs");

const rewireBabelLoader = require("craco-babel-loader");

// helpers

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
  plugins: [
    //This is a craco plugin: https://github.com/sharegate/craco/blob/master/packages/craco/README.md#configuration-overview
    {
      plugin: rewireBabelLoader,
      options: {
        includes: [resolveApp("src/chromeServices/highlighterContentScript.ts"), resolveApp("src/background.ts"), resolveApp("src/chromeServices/pageLogic.ts")], //put things you want to include in array here
        excludes: [/(node_modules|bower_components)/] //things you want to exclude here
        //you can omit include or exclude if you only want to use one option
      }
    }
  ],
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      return {
        ...webpackConfig,
        entry: {
          main: [env === 'development' && require.resolve('react-dev-utils/webpackHotDevClient'), paths.appIndexJs].filter(Boolean),
          // content: './src/chromeServices/highlighterContentScript.ts',
          // background: './src/background.ts',
          // osobisty: './src/chromeServices/pageLogic.ts',
        },
        output: {
          ...webpackConfig.output,
          filename: 'static/js/[name].js'
        },
        // module: {

        //   rules: [
        //     {
        //       test: /(highlighterContentScript\.ts|background\.ts|pageLogic\.ts)$/,
        //       include: [path.resolve(__dirname, 'src')],
        //       exclude: /node_modules/,
        //       use: [{
        //         loader: 'ts-loader'
        //       }]
        //     }
        //   ]
        // },
        optimization: {
          ...webpackConfig.optimization,
          runtimeChunk: false,
          splitChunks: {
            chunks(chunk) {
              return false
            },
          },
        },
      }
    },
  }
}