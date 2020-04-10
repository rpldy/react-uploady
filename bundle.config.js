/**
 * config for scripts/bundle.js
 */
const path = require("path");

const PKGS =  {
    LIFE_EVENTS: "@life-events",
    SHARED: "@shared",
    SENDER: "@sender",
    UPLOADER: "@uploader",
    SHARED_UI: "@shared-ui",
    UPLOADY: "@uploady",
};

module.exports = {
    org: "@rpldy/",
    targets: {
        umd: "umd",
    },
    bundles: {
        umd: {
            /**
             * Bundle the core functionality (no UI)
             */
            "core": {
                maxSize: 9500,
                pkgs: [PKGS.LIFE_EVENTS, PKGS.SHARED, PKGS.SENDER, PKGS.UPLOADER],
                target: PKGS.UPLOADER,
            },

            /**
             * Bundle the core functionality + core UI
             */
            "ui-core": {
                maxSize: 12000,
                pkgs: ["core", PKGS.SHARED_UI, PKGS.UPLOADY],
                target: PKGS.UPLOADY,
                config: {
                    externals: ["react", "react-dom"],
                },
            },

            /**
             * Bundle the entire repo's functionality
             */
            // "all": {
            //
            // },

            /**
             * Bundle a umd bundle per repo package, without internal dependencies
             */
            "package": {
                pkgs: "*",
                target: "*", //output relative to package
                config: (entries, isProduction) => {
                    const entry = entries.reduce((res, pkg) => {
                        res[pkg.name.split("/")[1]] = pkg.location;
                        return res;
                    }, {});

                    return {
                        entry,
                        externals: [/@rpldy/, "react", "react-dom"],
                        output: {
                            filename: `rpldy.[name]${isProduction ? ".min" : ""}.js`,
                        }
                    };
                }
            },
        },
    },

    webpackConfig: {
        base: {
            mode: "development",

            devtool: "source-map",

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
            },

            resolve: {
                alias: {
                    "immer": path.resolve(__dirname, "packages/shared/src/utils/produce"),
                }
            }
        },

        production: {
            mode: "production",
            devtool: "cheap-module-source-map",
        }
    },
};
