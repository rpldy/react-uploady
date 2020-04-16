import React from "react";

const Uploady = () => <div/>;

const composeEnhancers = jest.fn();

Uploady.composeEnhancers = composeEnhancers;

jest.doMock("@rpldy/uploady", () => Uploady);

export default Uploady;

export {
    Uploady,
    composeEnhancers,
};

