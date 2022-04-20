const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  devtool: "source-map",
  entry: {
    main: path.resolve(__dirname, "src/index.ts")
  },
  output: {
    clean: true,
    path: path.resolve(__dirname, "build")
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        exclude: /node_modules/,
        use: ["babel-loader", "ts-loader"]
      },
      {
        test: /.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: "css-loader", options: { url: false } },
          "postcss-loader",
          "less-loader"
        ]
      },
      {
        test: /.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              url: false
            }
          },
          "postcss-loader"
        ]
      }
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "fonts"),
          to: path.resolve(__dirname, "build/assets/fonts")
        }
      ]
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src/index.html"),
      inject: "body",
      publicPath: "/"
    })
  ],
  resolve: {
    extensions: [".ts", ".js"]
  },
  watchOptions: {
    ignored: /node_modules/
  }
};
