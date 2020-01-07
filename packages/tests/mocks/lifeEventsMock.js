const mockTrigger = jest.fn();

jest.doMock("@rpldy/life-events", () =>
	(target) => {

		return {
			target,
			trigger: mockTrigger,
		};
	});

export {
	mockTrigger,
};


