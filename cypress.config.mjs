import testsWebpackConfig from "./cypress/webpack.cypress.config.mjs";
import cypressAwesomeReporterPlugin from "cypress-mochawesome-reporter/plugin.js";

const threadIndex = process.env.PRLL_THREAD_INDX || 0;

export default {
    reporter: "cypress-multi-reporters",
    reporterOptions: {
        reporterEnabled: "cypress-mochawesome-reporter, mocha-junit-reporter",
        mochaJunitReporterReporterOptions: {
            mochaFile: "cypress/results/results-[suiteName].xml"
        },
        //using Mochawesome Reporter for its ability to store json report files
        cypressMochawesomeReporterReporterOptions: {
            reportDir: "cypress/reports/mochawesome",
            reportFilename: "report-[status]_[name]",
            removeJsonsFolderAfterMerge: false,
            charts: false,
            json: true,
            saveJson: true,
            html: false,
            saveHtml: false,
            reportPageTitle: "Uploady Test Results"
        },
    },

    e2e: {
        port: (8089 + parseInt(threadIndex)),
        specPattern: "cypress/integration/**/*-spec.js",
        chromeWebSecurity: false,
        video: false,
        env: {
            storybookPath: "/?path=/story/",
            components: {
                mockSender: "core-mock-sender",
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

        setupNodeEvents: cypressAwesomeReporterPlugin,
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
