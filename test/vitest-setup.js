import { afterEach } from "vitest";
import { render, renderIntoDocument, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import chai from "chai";
import chaiDom from "chai-dom";
import userEvent from "@testing-library/user-event";

global.render = render;
global.renderIntoDocument = renderIntoDocument;
global.userEvent = userEvent;

chai.use(chaiDom);

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
    cleanup();
});

global.clearViMocks = (...mocks) => {
    mocks.forEach((mock) => {
        if (mock) {
            if (mock.mockClear) {
                mock.mockClear();
            } else {
                global.clearViMocks(...Object.values(mock));
            }
        }
    });
};
