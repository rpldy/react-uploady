const path = require("path");

console.log("+++ ENV = ", process.env.NODE_ENV);

const isProduction = process.env.NODE_ENV === "production";

const config = {
    mode: isProduction ? "production" : "development",

    entry: {
        "uploader": "./packages/uploader",
        "life-events": "./packages/life-events",
        "sender": "./packages/sender",
        "shared": "./packages/shared",
    },

    output: {
        path: path.join(__dirname, "bundle"),
        filename: "rpldy.[name].js",
        library: ["rpldy", "[name]"],
        libraryTarget: "umd"
    },

    // devtool: isProduction ? false : "eval-cheap-module-source-map",
    devtool: "source-map",

    externals: [/lodash/, "immer", /@rpldy/],
// {
//         "lodash": "lodash",
//         // lodash: {
//         //     commonjs: "lodash",
//         //     commonjs2: "lodash",
//         //     amd: "lodash",
//         //     root: "_",
//         // }
//     },

    module: {
        rules: [
            {
                test: /\.?js$/,
                exclude: /node_module/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            }
        ]
    }
};

if (!isProduction) {
    config.devtool = "cheap-module-source-map";
        //"eval-cheap-module-source-map";
}

module.exports = config;
