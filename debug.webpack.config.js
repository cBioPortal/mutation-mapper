const webpack = require('webpack');
var CircularDependencyPlugin = require("circular-dependency-plugin");
var ProvidePlugin = webpack.ProvidePlugin;

var config =
{
	entry: __dirname + "/debug/main.js",
	output: {
		path: __dirname + "/build",
		filename: "debug.bundle.js"
	},
	resolve: {
		alias: {
			'jquery-ui': 'jquery-ui/ui/widgets',
			'jquery-ui-css': 'jquery-ui/../../themes/base',
			'datatables': __dirname + '/src/js/helper/datatables'
		}
	},
	module: {
		loaders: [
			{test: /\.css$/, loader: "style!css"},
			// image loader
			{
				test: /\.(jpe?g|png|gif|ico)$/i,
				//exclude: /node_modules/,
				loader: "file?name=images/[name].[ext]"
			},
			// font loader
			{
				test: /\.(ttf|eot|svg|woff2?)(\?v=[a-z0-9=\.]+)?$/i,
				loader: "file?name=images/[name].[ext]"
			},
			// disable AMD for datatables
			{
				test: require.resolve("datatables.net"),
				loader: "imports?define=>false"
			}
		]
	},
	plugins: [
		new CircularDependencyPlugin(),
		new ProvidePlugin({
			$: "jquery",
			jQuery: "jquery"
		})
	]
};

module.exports = config;