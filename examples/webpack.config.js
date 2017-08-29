const {CheckerPlugin} = require('awesome-typescript-loader');

module.exports = {
  entry: './src/scripts/index.ts',
  output: {
    path: __dirname + '/dist/scripts',
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.ts']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          'awesome-typescript-loader'
        ]
      }
    ]
  },
  plugins: [
    new CheckerPlugin()
  ]
};
