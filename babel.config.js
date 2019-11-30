module.exports = {
	presets: [
		[
			"@babel/env",
			{
				modules: false,
			},
		],
		"@babel/react",
		"@babel/flow",
	],
	plugins: [
		"babel-plugin-styled-components",
		"@babel/plugin-proposal-function-bind",
		"@babel/plugin-proposal-class-properties",
		"lodash",
	],
	env: {
		test: {
			plugins: ['@babel/plugin-transform-runtime'],
			presets: [
				[
					'@babel/env',
					{
						targets: {
							node: true,
						},
					},
				],
			],
		},
	}
};