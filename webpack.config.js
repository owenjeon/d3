const path = require('path');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
let webpack = require('webpack');

module.exports = {
  entry: {
    "index": [
      "./wp/src/index.ts"
    ]
  },
  output: {
    "path": path.join(process.cwd(), "wp/dist"),
    "filename": "[name].bundle.js",
    "chunkFilename": "[id].chunk.js"
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'awesome-typescript-loader' }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        // warnings: false, // 콘솔 창에 출력되는 게 보기 귀찮다면 요 놈을 주석 제거하면 된다.
        unused: true // 요 놈이 핵심
      },
      mangle: false,    // DEMO ONLY: Don't change variable names.(난독화)
      beautify: true,   // DEMO ONLY: Preserve whitespace (가독성 좋게 함)
      output: {
        comments: true  // DEMO ONLY: Helpful comments (주석 삭제 안 함)
      }
    })
  ],
  resolve: {
    modules: [
      'node_modules',
      path.resolve(__dirname, 'wp/src')
    ],
    extensions: ['.ts', '.js']
  }
};