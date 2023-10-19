import addLife, { createLifePack } from "@rpldy/life-events";

const mockTrigger = vi.fn();

vi.mock("@rpldy/life-events", () => {
    return {
        default: vi.fn((target) => ({
            target,
            trigger: mockTrigger,
        })),
        createLifePack: vi.fn(),
    }
});

export default addLife;

export {
    createLifePack,
    mockTrigger,
};
