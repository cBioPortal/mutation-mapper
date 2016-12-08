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
var isExternal = (EXT_LIB === 'true') || (EXT_LIB === '1');
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
	test: /\.(jpe?g|png|gif|ico)$/i,
	loader: "file?name=images/[name].[ext]"
};
var fontLoader = {
	test: /\.(ttf|eot|svg|woff2?)(\?v=[a-z0-9=\.]+)?$/i,
	loader: "file?name=images/[name].[ext]"
};

// configure externals
if (isExternal)
{
	externals = [
		"d3",
		"jquery-expander",
		"jquery-flesler-scrollto",
		{
			"jquery": {
				root: "jQuery",
				amd: "jquery",
				commonjs: "jquery",
				commonjs2: "jquery"
			},
			"underscore": {
				root: "_",
				amd: "underscore",
				commonjs: "underscore",
				commonjs2: "underscore"
			},
			"backbone": {
				root: "Backbone",
				amd: "backbone",
				commonjs: "backbone",
				commonjs2: "backbone"
			},
			"filesaver.js-npm": {
				root: "window",
				amd: "filesaver.js-npm",
				commonjs: "filesaver.js-npm",
				commonjs2: "filesaver.js-npm"
			},
			"3dmol/release/3Dmol-nojquery": {
				root: "$3Dmol",
				amd: "3dmol/release/3Dmol-nojquery",
				commonjs: "3dmol/release/3Dmol-nojquery",
				commonjs2: "3dmol/release/3Dmol-nojquery"
			}
		},
		/qtip2/,
		/jquery-tipTip/,
		/jquery-ui/,
		/datatables\.net/,
		/datatables\-/
		// TODO legacy libs (ones with no npm entry)
		///ui\.tabs\.paging/,
		///fnSetFilteteringDelay/
	];

	imageLoader.exclude = /node_modules/;
	fontLoader.exclude = /node_modules/;
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
			fontLoader,
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