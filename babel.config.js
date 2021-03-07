const env = process.env.BABEL_ENV;

module.exports = {
	presets: [
		[
			"@babel/env",
			{
                // "loose":  true,
                "modules": env === "esm" ? false : "commonjs"
			},
		],
		"@babel/react",
		"@babel/flow",
	],
	plugins: [
		"@babel/plugin-proposal-function-bind",
		"@babel/plugin-proposal-class-properties",
		"@babel/plugin-proposal-optional-chaining",
        "@babel/plugin-proposal-export-default-from",
        "minify-dead-code-elimination",
        ["inline-replace-variables", {
            "BUILD_TIME_VERSION": {
                type: "node",
                replacement: "process.env.BUILD_TIME_VERSION"
            }
        }],
        "transform-inline-environment-variables",

        // "@babel/plugin-transform-runtime",
        // ["@babel/plugin-transform-runtime", {
        //     corejs: 3,
        //     "version": "^7.10.2"
        // }],
		"lodash",
		["module-resolver", {
			"root": ["./"],
			// "alias": {}
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
