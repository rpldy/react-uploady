module.exports = {
	presets: [
		[
			"@babel/env",
			{
				// modules: false,
			},
		],
		"@babel/react",
		"@babel/flow",
	],
	plugins: [
		"@babel/plugin-proposal-function-bind",
		"@babel/plugin-proposal-class-properties",
		"@babel/plugin-proposal-optional-chaining",
		"lodash",
		["module-resolver", {
			"root": ["./"],
			// "alias": {
			// }
		}]
	],
	env: {
		test: {
			plugins: ["@babel/plugin-transform-runtime"],
			presets: [
				[
					"@babel/env",
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
