module.exports = {
	cacheDirectory: ".jest-cache",
	coverageDirectory: ".jest-coverage",
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
			branches: 85,
			functions: 85,
			lines: 85,
			statements: 85
		},
		"packages/*/src/**/*.js": {
			branches: 90,
			functions: 90,
			lines: 90,
			statements: 90
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
	testPathIgnorePatterns: ["<rootDir>/packages/(?:.+?)/lib/"],
	"setupFilesAfterEnv": [
		"./node_modules/jest-enzyme/lib/index.js",
		"<rootDir>/test/jestSetup.js"
	],
	"testEnvironment": "<rootDir>/test/jsdomEnv.js",
	// "testURL": "https://www.somthing.com/test.html"
};
