const path = require('path');

module.exports = {
  style: {
    postcss: {
      plugins: [
        require('tailwindcss')(path.resolve(__dirname, 'tailwind.config.js')), // Explicit path
        require('autoprefixer'),
      ],
    },
  },
  // You may also need to check for module resolution issues in Webpack:
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.extensions.push('.jsx');
      return webpackConfig;
    },
  },
};