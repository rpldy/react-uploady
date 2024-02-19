import { afterEach } from "vitest";
import { render, renderIntoDocument, renderHook, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import chai from "chai";
import chaiDom from "chai-dom";
import userEvent from "@testing-library/user-event";

global.render = render;
global.renderIntoDocument = renderIntoDocument;
global.renderHook = renderHook;
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

const suppressConsoleError = () => {
    const errorSpy = vi.spyOn(console, "error")
        .mockImplementation(() => {
            //do nothing
        });

    return () => errorSpy.mockRestore();
};

global.renderHookWithError = (...args) => {
    let error;
    const restore = suppressConsoleError();

    try {
        renderHook(...args);
    } catch (ex) {
        error = ex;
    }

    restore();
    throw error;
};

if (!window.DragEvent) {
//JSDOM (still) hasnt implemented drag event... https://github.com/jsdom/jsdom/issues/2913
//thanks: https://gist.github.com/alexreardon/cbc317ede2212d6db59ba5ff59dcf419
    class DragEvent extends MouseEvent {
        constructor(type, eventInitDict = {}) {
            super(type, eventInitDict);
        }
    }

    window.DragEvent = DragEvent;
}
