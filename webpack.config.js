module.exports = {
	entry: "./src/js/MutationMapper.js",
	output: {
		path: "./build",
		filename: "mutationMapper.bundle.js"
	},
	module: {
		loaders: [
			{ test: /\.css$/, loader: "style!css" }
		]
	}
};
