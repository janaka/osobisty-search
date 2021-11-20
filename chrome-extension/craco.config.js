//const CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      return {
        ...webpackConfig,
        entry: {
          main: [env === 'development' && require.resolve('react-dev-utils/webpackHotDevClient'), paths.appIndexJs].filter(Boolean),
          content: './src/chromeServices/highlighterContentScript.ts',
          background: './src/background.ts',
          osobisty: './src/chromeServices/pageLogic.ts',
        },
        output: {
          ...webpackConfig.output,
          // filename: (pathData) => {
          //   let filename  = 'static/js/[name].js';

          //   if (pathData.chunk.ext === '.css') {
          //     filename = 'static/css/[name].css';
          //   }
          //   return filename;
          // },
          filename: 'static/js/[name].js'
        },
        optimization: {
          ...webpackConfig.optimization,
          runtimeChunk: false,
          splitChunks: {
            chunks(chunk) {
              return false
            },
          },
        },
        //   plugins: [
        //     ...webpackConfig.plugins,
        //     new CopyWebpackPlugin({patterns: [
        //         {
        //             //Wildcard is specified hence will copy only css files
        //             from: 'src/chromeServices/contentcss.css', //Will resolve to RepoDir/src/css and all *.css files from this directory
        //             to: 'css'//Copies all matched css files from above dest to build/css
        //         }
        //     ]})
        // ]
      }
    },
  }
}