import React from "react";

const Uploady = vi.fn(() => <div/>);

const composeEnhancers = vi.fn();

// Uploady.composeEnhancers = composeEnhancers;

vi.doMock("@rpldy/uploady", () => ({
    default: Uploady,
    composeEnhancers,
}));

export default Uploady;

export {
    Uploady,
    composeEnhancers,
};

