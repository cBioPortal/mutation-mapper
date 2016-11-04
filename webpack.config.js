const webpack = require('webpack');
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var CircularDependencyPlugin = require("circular-dependency-plugin");

var NODE_ENV = process.env.NODE_ENV || 'development';
var isDev = NODE_ENV === 'development';
var isTest = NODE_ENV === 'test';
var isProduction = NODE_ENV === 'production';
var libraryName = "mutationMapper";
var outputFile = libraryName + ".js";
var plugins = [new CircularDependencyPlugin()];

if (isProduction) {
	plugins.push(new UglifyJsPlugin({ minimize: true }));
	outputFile = libraryName + ".min.js";
}

var config =
{
	entry: __dirname + "/src/js/MutationMapper.js",
	output: {
		path: __dirname + "/build",
		filename: outputFile,
		library: libraryName,
		libraryTarget: "umd"
	},
	module: {
		loaders: [
			{ test: /\.css$/, loader: "style!css" }
		]
	},
	plugins: plugins
};

module.exports = config;