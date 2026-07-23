const env = process.env.BABEL_ENV,
    isUploadyBundle = process.env.UPLOADY_BUNDLE;

//inlines process.env.X member expressions into literal values at build time.
//replaces babel-plugin-transform-inline-environment-variables, which is unmaintained
//and broken under @babel/traverse 8.x (relies on the removed path.toComputedKey API)
function inlineEnvVariables({ types: t }) {
    return {
        visitor: {
            MemberExpression(path) {
                if (path.get("object").matchesPattern("process.env")) {
                    const property = path.node.property;

                    const key = path.node.computed
                        ? (t.isStringLiteral(property) ? property.value : null)
                        : property.name;

                    if (key != null) {
                        path.replaceWith(t.valueToNode(process.env[key]));
                    }
                }
            },
        },
    };
}

const productionConfig = {
    plugins: [
        //cant add to base because breaks unit-tests that modify process.env
        inlineEnvVariables,

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
    ],
    plugins: [
        "@babel/plugin-proposal-function-bind",
        "@babel/plugin-proposal-export-default-from",
        ["module-resolver", {
            "root": ["./"],
            // "alias": {}
        }]
    ],
    overrides: [
        {
            test: /\.jsx?$/,
            presets: ["@babel/flow"],
            plugins: [
                "babel-plugin-syntax-hermes-parser",
            ],
        },
        {
            test: /\.tsx?$/,
            presets: ["@babel/preset-typescript"],
        },
    ],
    env: {
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
