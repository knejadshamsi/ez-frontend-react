const path = require('path');
const CracoLessPlugin = require('craco-less');

module.exports = {
  webpack: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
      '~globalStores': path.resolve(__dirname, 'src/globalStores'),
      '~ez': path.resolve(__dirname, 'src/Services/ez'),
      '~store': path.resolve(__dirname, 'src/Services/ez/stores/index'),
      '~stores/*': path.resolve(__dirname, 'src/Services/ez/stores/*'),
      '~styles': path.resolve(__dirname, 'src/Services/ez/styles'),
      '~components': path.resolve(__dirname, 'src/Services/ez/components')
    },
    configure: (webpackConfig) => {
      webpackConfig.resolve.fullySpecified = false;
      return webpackConfig;
    }
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
