const env = process.env.BABEL_ENV,
    isUploadyBundle = process.env.UPLOADY_BUNDLE;

const productionConfig = {
    plugins: [
        //cant add to base because breaks unit-tests that modify process.env
        "transform-inline-environment-variables",
    ]
};

const config =  {
    exclude: [
        /utils\/isProduction/,
    ],
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
        "@babel/plugin-proposal-nullish-coalescing-operator",
        //adding these here to stop sb build from breaking on loose mode issue :(
        "@babel/plugin-proposal-private-methods",
        "@babel/plugin-proposal-private-property-in-object",
        "minify-dead-code-elimination",
        "lodash",
        ["module-resolver", {
            "root": ["./"],
            // "alias": {}
        }]
    ],
    env: {
        development: {
            //adding loose = true to remove warnings in SB build (only in dev)
            plugins: [
                ["@babel/plugin-proposal-class-properties", { loose: true }],
                ["@babel/plugin-proposal-private-methods", { loose: true }],
                ["@babel/plugin-proposal-private-property-in-object", { loose: true }],
            ]
        },
        //cant use plugin when building storybook :(
        production: isUploadyBundle ? productionConfig : undefined,
        esm: productionConfig,
        cjs: productionConfig,

        test: {
            plugins: [
                "@babel/plugin-transform-runtime",
            ],
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

module.exports = config;

//     () => {
// console.log("!!!!!!!!! BABEL ENV ==== ", api.env());
//     console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$ ", process.env.BUILD_TIME_VERSION)
//
//     // api.caller((caller) => {
//     //     console.log("!!!!!!!!!!!!!!!!! BABEL CALLER !!!!!!!!!!!!!!! ", caller);
//     // });
//
//     return config;
// };
