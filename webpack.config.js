const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/main.jsx',
  devtool: 'source-map',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.[j|t]sx?$/i,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                mode: 'local',
                localIdentName: '[name]-[local]'
              }
            },
          }
        ]
      }
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public', to: '.' },
        { from: 'png', to: 'png' },
      ],
      options: {
        concurrency: 100,
      },
    })
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'build'),
    clean: true
  },
  stats: {
    errorDetails: true
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
    client: {
      logging: 'none',
      overlay: {
        errors: true,
        warnings: false
      }
    }
  },
};
