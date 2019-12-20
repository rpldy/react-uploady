module.exports = ({ config }) => {
	config.module.rules.push({
		test: /\.stor(y|ies)\.jsx?$/,
		loaders: [{
			loader: require.resolve("@storybook/source-loader"),
			// options: { parser: "flow"},
		}],
		enforce: "pre",
	});

	return config;
};