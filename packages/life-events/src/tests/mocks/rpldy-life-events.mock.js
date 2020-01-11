const mockTrigger = jest.fn();

const addLife = jest.fn((target) => ({
	target,
	trigger: mockTrigger,
}));

jest.doMock("@rpldy/life-events", () => addLife);

export default addLife;

export {
	mockTrigger
};