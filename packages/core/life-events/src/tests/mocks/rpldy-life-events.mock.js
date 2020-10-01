const mockTrigger = jest.fn();

const addLife = jest.fn((target) => ({
    target,
    trigger: mockTrigger,
}));

const createLifePack = jest.fn();
addLife.createLifePack = createLifePack;

jest.doMock("@rpldy/life-events", () => addLife);

export default addLife;

export {
    createLifePack,
    mockTrigger
};
