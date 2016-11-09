const webpack = require('webpack');
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var CircularDependencyPlugin = require("circular-dependency-plugin");
var ProvidePlugin = webpack.ProvidePlugin;

var NODE_ENV = process.env.NODE_ENV || 'development';
var isDev = NODE_ENV === 'development';
var isTest = NODE_ENV === 'test';
var isProduction = NODE_ENV === 'production';
var libraryName = "mutationMapper";
var outputFile = libraryName + ".js";
var plugins = [
	new CircularDependencyPlugin(),
	new ProvidePlugin({
		$: "jquery",
		jQuery: "jquery",
		"window.jQuery": "jquery"
	})
];

// devServer config
var devHost = process.env.HOST || 'localhost';
var devPort = process.env.PORT || 3080;

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
			{test: /\.css$/, loader: "style!css"},
			{test: /\.(jpe?g|png|gif)$/i, loader:"file"},
			// disable AMD for datatables, we are using CommonJS
			{
				test: require.resolve("datatables.net"),
				loader: "imports?define=>false"
			},
			{
				test: require.resolve("drmonty-datatables-colvis"),
				loader: "imports?define=>false"
			}
		]
	},
	resolve: {
		alias: {
			'jquery-ui': 'jquery-ui/ui/widgets',
			'jquery-ui-css': 'jquery-ui/../../themes/base',
			'datatables': 'datatables.net'
		}
	},
	plugins: plugins,
	devServer: {
		historyApiFallback: false,
		hot: false,
		noInfo: false,
		quiet: false,
		lazy: false,
		publicPath: '/',
		contentBase: 'build',
		https: false,
		hostname: devHost,
		port: devPort,
		stats:'errors-only'
	}
};

module.exports = config;