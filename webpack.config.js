const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: {
    "index": "./wp/src/ts1.ts",
    //"another": './wp/src/another-module.ts'
  },
  output: {
    "path": path.join(__dirname, "wp/dist"),
    "filename": "[name].bundle.js",
    "chunkFilename": "[name].chunk.js"
  },
  devServer: {
    contentBase: path.join(__dirname, "wp/dist"),
    compress: true,
    port: 9000
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
    //new HTMLWebpackPlugin({title:'Code Spliting'}), //index.html 파일 생성
    //new webpack.optimize.CommonsChunkPlugin({ name: 'vendor'}),// 공통으로 쓰이는 의존 모듈들을 별개의 js파일로 분리해서 번들링 함
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: true, // 콘솔 창에 출력되는 게 보기 귀찮다면 요 놈을 주석 제거하면 된다.
        unused: true // 요 놈이 핵심
      },
      mangle: false,    // DEMO ONLY: Don't change variable names.(난독화)
      beautify: true,   // DEMO ONLY: Preserve whitespace (가독성 좋게 함)
      output: {
        comments: false  // DEMO ONLY: Helpful comments (주석 삭제 안 함)
      }
    })
  ]
};