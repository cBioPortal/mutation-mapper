const webpack = require('webpack');
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var CircularDependencyPlugin = require("circular-dependency-plugin");
var ProvidePlugin = webpack.ProvidePlugin;

var NODE_ENV = process.env.NODE_ENV || 'development';
var EXT_LIB = process.env.EXT_LIB || 'default';
var isDev = NODE_ENV === 'development';
var isTest = NODE_ENV === 'test';
var isProduction = NODE_ENV === 'production';
var isExternalGlobal = EXT_LIB === 'global';
var isExternalModule = EXT_LIB === 'module';
var libraryName = "mutationMapper";
var outputFile = libraryName + ".js";
var plugins = [
	new CircularDependencyPlugin(),
	new ProvidePlugin({
		$: "jquery",
		jQuery: "jquery"
		//"window.jQuery": "jquery"
	})
];

// devServer config
var devHost = process.env.HOST || 'localhost';
var devPort = process.env.PORT || 3080;

if (isProduction) {
	plugins.push(new UglifyJsPlugin({ minimize: true }));
	outputFile = libraryName + ".min.js";
}

var externals = null;

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
		// legacy jQuery libraries
		// (ones with no npm entry)
		/ui\.tabs\.paging/,
		/tipTip/,
		/fnSetFilteteringDelay/,
		// 3Dmol.js
		function(context, request, callback) {
			if (/\$3Dmol/.test(request)) {
				return callback(null, "$3Dmol");
			}
			else {
				callback();
			}
		}
	];
}
// configure externals for external modules
else if (isExternalModule)
{
	// TODO need to externalize loaders!
	externals = {
		//"jquery-ui": "^1.12.1",
		"d3": "d3",
		"jquery": "jquery",
		"underscore": "underscore",
		"backbone": "backbone",
		"datatables.net": "datatables.net",
		"datatables.net-dt": "datatables.net-dt",
		"jquery-flesler-scrollto": "jquery-flesler-scrollto",
		"jquery-expander": "jquery-expander",
		"datatables-tabletools": "datatables-tabletools",
		"drmonty-datatables-colvis": "drmonty-datatables-colvis",
		"qtip2": "qtip2",
		"filesaver.js-npm": "filesaver.js-npm"
	};
}


var config =
{
	entry: __dirname + "/src/js/api.js",
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
	externals: externals,
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