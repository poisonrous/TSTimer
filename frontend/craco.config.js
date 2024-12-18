const path = require('path-browserify');
const os = require('os-browserify/browser');
require('dotenv').config();

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.alias = {
        'path': require.resolve('path-browserify'),
        'os': require.resolve('os-browserify/browser'),
      };
      webpackConfig.resolve.fallback = {
        'fs': false, // Si no necesitas 'fs'
        'path': require.resolve('path-browserify'),
        'os': require.resolve('os-browserify/browser'),
      };
      return webpackConfig;
    },
  },
  devServer: {
    allowedHosts: ['http://localhost:5000', process.env.REACT_APP_BACKEND_URL],
  },
};
