const webpack = require('webpack');
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var CircularDependencyPlugin = require("circular-dependency-plugin");
var ProvidePlugin = webpack.ProvidePlugin;
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var NODE_ENV = process.env.NODE_ENV || 'development';
var EXT_LIB = process.env.EXT_LIB || 'default';
var isDev = NODE_ENV === 'development';
var isTest = NODE_ENV === 'test';
var isProduction = NODE_ENV === 'production';
var isExternalGlobal = EXT_LIB === 'global';
var isExternalModule = EXT_LIB === 'module';
var libraryName = "mutationMapper";
var outputLibFile = libraryName + ".js";
var outputStyleFile = libraryName + ".css";
var plugins = [];

// devServer config
var devHost = process.env.HOST || 'localhost';
var devPort = process.env.PORT || 3080;

if (isProduction) {
	plugins.push(new UglifyJsPlugin({ minimize: true }));
	outputLibFile = libraryName + ".min.js";
	outputStyleFile = libraryName + ".min.css";
}

plugins = [
	new CircularDependencyPlugin(),
	new ExtractTextPlugin(outputStyleFile),
	new ProvidePlugin({
		$: "jquery",
		jQuery: "jquery"
		//"window.jQuery": "jquery"
	})
].concat(plugins);

var externals = null;
var imageLoader = {
	test: /\.(jpe?g|png|gif)$/i,
	loader: "file?name=images/[name].[ext]"
};

// configure externals for global (window)
if (isExternalGlobal)
{
	externals = [
		// main vendor libs
		{
			"d3": "d3",
			"jquery": "jQuery",
			"underscore": "_",
			"backbone": "Backbone",
			"filesaver.js-npm": "window"
		},
		// jQuery plugin libs
		// (they do not need to be assigned to any global variable)
		/jquery-ui/,
		/jquery-expander/,
		/jquery-flesler-scrollto/,
		/datatables/,
		/qtip2/,
		/jquery-tipTip/,
		// legacy jQuery libraries
		// (ones with no npm entry)
		/ui\.tabs\.paging/,
		/fnSetFilteteringDelay/,
		// 3Dmol.js
		function(context, request, callback) {
			if (/3dmol/.test(request)) {
				return callback(null, "$3Dmol");
			}
			else {
				callback();
			}
		}
	];

	imageLoader.exclude = /node_modules/;
}
// configure externals for modules (commonjs)
else if (isExternalModule)
{
	externals = [
		"d3",
		"jquery",
		"underscore",
		"backbone",
		"jquery-flesler-scrollto",
		"jquery-expander",
		"filesaver.js-npm",
		/3dmol/,
		/qtip2/,
		/jquery-tipTip/,
		/jquery-ui/,
		/datatables\.net/,
		/datatables\-/
	];

	imageLoader.exclude = /node_modules/;
}

var config =
{
	entry: __dirname + "/src/js/api.js",
	output: {
		path: __dirname + "/build",
		filename: outputLibFile,
		library: libraryName,
		libraryTarget: "umd"
	},
	module: {
		loaders: [
			imageLoader,
			{test: /\.css$/, loader: ExtractTextPlugin.extract(
				'style',
				'css?')
			},
			{
				test: /.*template.*\.html$/,
				loader: "underscore-template-loader",
				query: {
					interpolate: "\\{\\{(.+?)\\}\\}",
					root: __dirname,
					parseDynamicRoutes: true
				}
			},
			// disable AMD for datatables, we are using CommonJS
			{
				test: require.resolve("datatables.net"),
				loader: "imports?define=>false"
			}
		]
	},
	externals: externals,
	resolve: {
		alias: {
			'jquery-ui': 'jquery-ui/ui/widgets',
			'jquery-ui-css': 'jquery-ui/../../themes/base',
			'datatables': __dirname + '/src/js/helper/datatables'
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