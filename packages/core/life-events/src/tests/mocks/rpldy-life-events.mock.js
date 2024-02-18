import addLife, { createLifePack as orgCreateLifePack } from "@rpldy/life-events";

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

export const createLifePack = orgCreateLifePack;

export {
    mockTrigger,
};
