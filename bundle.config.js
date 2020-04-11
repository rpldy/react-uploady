/**
 * config for scripts/bundle.js
 */

const path = require("path"),
    fs = require("fs-extra"),
    _ = require("lodash"),
    VirtualModulePlugin = require("virtual-module-webpack-plugin");

const PKGS = {
    LIFE_EVENTS: "@life-events",
    SHARED: "@shared",
    SENDER: "@sender",
    UPLOADER: "@uploader",
    SHARED_UI: "@shared-ui",
    UPLOADY: "@uploady",
};

let licenseContent;

module.exports = {
    org: "@rpldy/",

    library: "rpldy",

    targets: {
        umd: "umd",
    },

    banner: () => {
        if (!licenseContent) {
            licenseContent = fs.readFileSync(path.resolve(process.cwd(), "LICENSE.md"), { encoding: "utf-8" });
        }

        return licenseContent;
    },

    bundles: {
        umd: {
            /**
             * Bundle the core functionality (no UI)
             */
            "core": {
                pkgs: [PKGS.LIFE_EVENTS, PKGS.SHARED, PKGS.SENDER, PKGS.UPLOADER],
                target: PKGS.UPLOADER,
                maxSize: 10500,
            },

            /**
             * Bundle the core functionality + core UI
             */
            "ui-core": {
                pkgs: ["core", PKGS.SHARED_UI, PKGS.UPLOADY],
                target: PKGS.UPLOADY,
                config: {
                    externals: ["react", "react-dom"],
                },
                maxSize: 12500,
            },

            /**
             * Bundle the entire repo's functionality
             */
            "all": {
                pkgs: "*",
                target: PKGS.UPLOADY,
                config: (entries) => {
                    const exports = entries.map((entry) => {
                        const namespace = _.camelCase(entry.name.split("/")[1]);
                        return `import * as ${namespace} from "${entry.location}/src/index"; export { ${namespace} };`;
                    });

                    return {
                        output: {
                            library: "rpldy",
                            //["rpldy", "[name]"],
                        },

                        entry: "./packages/ui/uploady/all-bundle-entry.js",

                        plugins: [
                            new VirtualModulePlugin({
                                moduleName: "./packages/ui/uploady/all.generated.js",
                                contents: `
                                    ${exports.join(" \r\n")}
                                `,
                            })
                        ],

                        externals: ["react", "react-dom"],
                    };
                },
                maxSize: 16500,
            },

            /**
             * Bundle a umd bundle per repo package, without internal dependencies
             */
            "package": {
                pkgs: "*",
                target: "*", //output relative to package
                bundlePattern: `*(-runtime)?(\.min)?\\.js`,
                extraBundles: ["polyfills-bundle.js"],
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
                        },
                        optimization: {
                            runtimeChunk: {
                                name: (entrypoint) => `${entrypoint.name}-runtime`
                            }
                        },
                    };
                }
            },
        },
    },

    webpackConfig: {
        base: {
            mode: "development",

            devtool: "source-map",

            optimization: {
                splitChunks: {
                    cacheGroups: {
                        commons: {
                            test: /[\\/]node_modules[\\/]/,
                            name: "polyfills",
                            filename: "[name]-bundle.js",
                            // name: (module, chunks, cacheGroupKey)  => {
                            //     const moduleFileName = module.identifier().split('/').reduceRight(item => item);
                            //     const allChunksNames = chunks.map((item) => item.name).join('~');
                            //
                            //     console.log("!!!!!!! CHUNK NAME = ", {moduleFileName, allChunksNames});
                            //
                            //     return "vendors";
                            //     // return `${cacheGroupKey}-${allChunksNames}-${moduleFileName}`;
                            // },
                            chunks: "all"
                        }
                    }
                }
            },

            module: {
                rules: [
                    {
                        test: /\.?js$/,
                        exclude: /node_module/,
                        use: {
                            loader: "babel-loader",
                            options: {
                                presets: [["@babel/preset-env", {
                                    useBuiltIns: "usage",
                                    corejs: 3,
                                }]]
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
            optimization: {
                //needed for production build to work with single/shared polyfills bundle
                namedChunks: true,
                //needed for production build to work with single/shared polyfills bundle
                namedModules: true,
                //use hashed ids for smaller bundles
                moduleIds: "hashed",
            }
        }
    },
};

// const path = require("path");
//
// console.log("+++ ENV = ", process.env.NODE_ENV);
//
// const isProduction = process.env.NODE_ENV === "production";
//
// const config = {
//     mode: isProduction ? "production" : "development",
//
//     entry: [
//         "./packages/uploader",
//         "./packages/life-events",
//         "./packages/sender",
//         "./packages/shared",
//     ],
//     // entry: {
//     //     "uploader": "./packages/uploader",
//     //     "life-events": "./packages/life-events",
//     //     "sender": "./packages/sender",
//     //     "shared": "./packages/shared",
//     // },
//
//     output: {
//         path: path.join(__dirname, "bundle"),
//         filename: "rpldy.[name].js",
//         library: ["rpldy", "[name]"],
//         libraryTarget: "umd"
//     },
//
//     // devtool: isProduction ? false : "eval-cheap-module-source-map",
//     devtool: "source-map",
//
//     externals: [/@rpldy/],
//
//     module: {
//         rules: [
//             {
//                 test: /\.?js$/,
//                 exclude: /node_module/,
//                 use: {
//                     loader: "babel-loader",
//                     options: {
//                         presets: ["@babel/preset-env"]
//                     }
//                 }
//             }
//         ]
//     },
//
//     resolve: {
//         alias: {
//             "immer": path.resolve(__dirname, "packages/shared/src/utils/produce"),
//         }
//     }
// };
//
// if (!isProduction) {
//     config.devtool = "cheap-module-source-map";
//     //"eval-cheap-module-source-map";
// }
//
// module.exports = config;
