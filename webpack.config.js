const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
  entry: {
    background: './src/background.js',
    content: './src/content.js'
  },
  mode: 'production',
  output: {
    clean: true,
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  target: 'web',
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public', to: './' }
      ]
    })
  ]
};
