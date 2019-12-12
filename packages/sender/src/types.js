// @flow

export type MockOptions = {
	//the time in ms it should take to "upload"
	delay?: number,
	//the mock percentages to emit progress events on (default: 10, 25, 50, 75, 100)
	progressEvents?: string[],
};
