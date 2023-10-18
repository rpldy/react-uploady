import webpack from "webpack";

const config = {
    plugins: [
        new webpack.EnvironmentPlugin({
            "BUILD_TIME_VERSION": "test",
        }),
    ],

    resolve: {
        mainFields: ["main:dev", "module", "main"],
    },

    module: {
        rules: [
            {
                test: /\.?js$/,
                exclude: /node_module/,
                use: {
                    loader: "babel-loader",
                }
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ]
    },
};

export default config;
