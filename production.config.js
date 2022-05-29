const path = require("path")

const AfterBuildPlugin = require("@fiverr/afterbuild-webpack-plugin")
const { inlineScriptTags } = require("inline-scripts")
const inlineStylesheets = require("inline-scripts/src/inlineStylesheets")
const { writeFile, unlink } = require("fs/promises")

const after = async () => {
	console.log("after")
	const withScripts = await inlineScriptTags("dist/index.html")
	// write the script to the dist/index.html
	await writeFile("dist/index.html", withScripts, "utf8")
	// take string after `</style>`
	const afterStyle = withScripts.split(`<link href="main.css" rel="stylesheet">`)[1]
	// inline the stylesheets
	const withStylesheets = await inlineStylesheets("dist/index.html") + afterStyle
	// write the stylesheets to the dist/index.html
	await writeFile("dist/index.html", withStylesheets, "utf8")
}

const HtmlWebpackPlugin = require("html-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin")
const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")

module.exports = {
	entry: "./src/index.ts",
	// devtool: "source-map",
	// mode: "development",
	mode: "production",
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
			{
				test: /\.css$/i,
				use: [MiniCssExtractPlugin.loader, "css-loader"],
			},
		],
	},
	plugins: [
		new MiniCssExtractPlugin(),
		new HtmlWebpackPlugin({
			title: "Tetris",
			template: "static/index.html",
		}),
	],
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
	},
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "dist"),
	},
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin(),
			new HtmlMinimizerPlugin(),
			new CssMinimizerPlugin(),
			new AfterBuildPlugin(after),
		],
	},
}
