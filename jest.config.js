module.exports = {
	cacheDirectory: ".jest-cache",
	coverageDirectory: ".jest-coverage",
	coveragePathIgnorePatterns: ["<rootDir>/packages/(?:.+?)/lib/"],
	coverageReporters: [
		"json",
		"lcov",
		"text",
		"html"],
	coverageThreshold: {
		global: {
			branches: 100,
			functions: 100,
			lines: 100,
			statements: 100
		}
	},
	"collectCoverageFrom": [
		"src/**/*.js",
		"!src/**/*.test.js",
		"!src/**/*.json"
	],
	testPathIgnorePatterns: ["<rootDir>/packages/(?:.+?)/lib/"],
	// "setupFilesAfterEnv": ["<rootDir>/test/jestSetup.js"],
	// "testEnvironment": "<rootDir>/test/jsdomEnv.js",
	// "testURL": "https://www.somthing.com/test.html"
};