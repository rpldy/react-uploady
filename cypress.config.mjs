import testsWebpackConfig from "./cypress/webpack.cypress.config.mjs";

export default {
    e2e: {
        port: 8089,
        specPattern: "cypress/integration/**/*-spec.js",
        chromeWebSecurity: false,
        video: false,
        env: {
            storybookPath: "/?path=/story/",
            components: {
                mockSender :"core-mock-sender",
                uploader: "core-uploader",
                uploady: "ui-uploady",
                chunkedUploady: "ui-chunked-uploady",
                retryHooks: "ui-retry-hooks",
                uploadButton: "ui-upload-button",
                uploadDropZone: "ui-upload-drop-zone",
                uploadUrlInput: "ui-upload-url-input",
                uploadPreview: "ui-upload-preview",
                uploadPaste: "ui-upload-paste",
                tusUploady: "ui-tus-uploady",
                nativeUploady: "react-native-native-uploady",
                chunkedSender: "core-chunked-sender",
            },
            UPLOAD_URL: process.env.UPLOAD_URL
        },
        projectId: "excxm9",
    },

    component: {
        specPattern: "cypress/component/**/*-ctest.js",
        devServer: {
            framework: "react",
            bundler: "webpack",
            webpackConfig: testsWebpackConfig,
        },
    },
};
