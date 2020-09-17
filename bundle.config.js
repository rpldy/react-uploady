/**
 * config for scripts/bundle.js
 */

const path = require("path"),
    fs = require("fs-extra"),
    webpack = require("webpack"),
    _ = require("lodash"),
    VirtualModulePlugin = require("virtual-module-webpack-plugin");

const PKGS = {
    LIFE_EVENTS: "@life-events",
    SHARED: "@shared",
    SENDER: "@sender",
    UPLOADER: "@uploader",
    SHARED_UI: "@shared-ui",
    UPLOADY: "@uploady",
    CHUNKED_UPLOADY: "@chunked-uploady",
};

let licenseContent;

module.exports = {
    org: "@rpldy/",

    library: "rpldy",

    targets: {
        umd: "umd",
    },

    bundles: {
        umd: {
            /**
             * Bundle the core functionality (no UI)
             */
            "core": {
                pkgs: [PKGS.LIFE_EVENTS, PKGS.SHARED, PKGS.SENDER, PKGS.UPLOADER],
                target: PKGS.UPLOADER,
                maxSize: 11000,
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
                maxSize: 14000,
            },

            /**
             * Bundle the core functionality + core UI + Chunked Uploady
             */
            "ui-core-chunked": {
                pkgs: ["ui-core", PKGS.CHUNKED_UPLOADY],
                target: PKGS.CHUNKED_UPLOADY,
                config: {
                    externals: ["react", "react-dom"],
                },
                maxSize: 17000,
            },

            /**
             * Bundle the entire repo's functionality
             */
            "all": {
                pkgs: "*",
                exclude: ["native-uploady"],
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

                        optimization: {
                            splitChunks: {
                                cacheGroups: {
                                    commons: {
                                        filename: "[name]-all-bundle.js",
                                    }
                                }
                            }
                        },
                    };
                },
                maxSize: 23500,
            },

            //TODO: find a way to make this work with global object assignment (wepackages/tus-sender/src/tusSender/initTusUpload/createUpload.js:88:94bpack externals root)
            //
            // /**
            //  * Bundle a umd bundle per repo package, without internal dependencies
            //  */
            // "package": {
            //     pkgs: "*",
            //     target: "*", //output relative to package
            //     bundlePattern: `*(-runtime)?(\.min)?\\.js`,
            //     extraBundles: ["polyfills-bundle.js"],
            //     config: (entries, isProduction) => {
            //         const entry = entries.reduce((res, pkg) => {
            //             res[pkg.name.split("/")[1]] = pkg.location;
            //             return res;
            //         }, {});
            //
            //         return {
            //             entry,
            //             externals: ["react", "react-dom",
            //                 (context, request, callback) => {
            //                     return /@rpldy/.test(request) ? callback(null, {
            //                         commonjs: request,
            //                         commonjs2: request,
            //                         amd: request,
            //                         root: request,
            //                     }) : callback();
            //                         //[`commonjs ${request}`, `amd ${request}`]) : callback();
            //                 }
            //                 ],
            //             output: {
            //                 library: ["rpldy", "[name]"],
            //                 filename: `rpldy.[name]${isProduction ? ".min" : ""}.js`,
            //             },
            //             optimization: {
            //                 runtimeChunk: {
            //                     name: "package-runtime",
            //                 }
            //             },
            //         };
            //     }
            // },
        },
    },

    webpackConfig: {
        base: {
            mode: "development",

            devtool: "source-map",

            resolve: {
                mainFields: ["main:dev", "module", "main"],
            },

            optimization: {
                splitChunks: {
                    cacheGroups: {
                        commons: {
                            test: /[\\/]node_modules[\\/]/,
                            name: "polyfills",
                            filename: "[name]-bundle.js",
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
                                    useBuiltIns: false,
                                    // corejs: 3,
                                }]],
								plugins: [["@babel/plugin-transform-runtime", {
									corejs: 3,
									"version": "^7.10.2"
								}]]
                            }
                        }
                    }
                ]
            },
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
            },
            plugins: [
                new webpack.BannerPlugin({
                    banner: () => {
                        if (!licenseContent) {
                            licenseContent = fs.readFileSync(path.resolve(process.cwd(), "LICENSE.md"), { encoding: "utf-8" });
                        }

                        return licenseContent;
                    }
                }),
            ],
        }
    },
};
