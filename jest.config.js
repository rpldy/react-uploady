module.exports = {
	cacheDirectory: ".jest-cache",
	coverageDirectory: ".jest-coverage",
    // reporters: ["default", "jest-junit"],
    moduleNameMapper: {
        "^@rpldy\/([\w-]*)$": `<rootDir>/node_modules/@rpldy/$1/src/index.js`,
    },
	coveragePathIgnorePatterns: ["<rootDir>/packages/(?:.+?)/lib/"],
	coverageReporters: [
		"json",
		"lcov",
		"text",
		"html"],
	coverageThreshold: {
		"packages/ui/**/src/**/*.js": {
			branches: 90,
			functions: 95,
			lines: 90,
			statements: 90
		},
		"packages/*/src/**/*.js": {
			branches: 92,
			functions: 98,
			lines: 98,
			statements: 98
		}
	},
	"collectCoverageFrom": [
		"<rootDir>/packages/**/src/**/*.js",
		"!<rootDir>/packages/**/**/*.test.js",
		"!<rootDir>/packages/**/*.story.js",
		"!<rootDir>/packages/**/*.stories.js",
		"!<rootDir>/packages/**/*.json",
		"!<rootDir>/packages/**/*.mock.*"
	],
	testPathIgnorePatterns: [
	    "<rootDir>/packages/(?:.+?)/lib/",
        "<rootDir>/cypress"
    ],
	"setupFilesAfterEnv": [
		"./node_modules/jest-enzyme/lib/index.js",
		"<rootDir>/test/jestSetup.js"
	],
	"testEnvironment": "jest-environment-jsdom-global",
};
