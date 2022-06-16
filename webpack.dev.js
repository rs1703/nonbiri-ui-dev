const config = require("./webpack.base.js");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

config.mode = "development";
config.output.filename = () => "assets/js/[name].development.js";

config.plugins.push(
  new MiniCssExtractPlugin({
    filename: "assets/css/[name].development.css",
    chunkFilename: "assets/css/[id].development.css"
  })
);

module.exports = config;
