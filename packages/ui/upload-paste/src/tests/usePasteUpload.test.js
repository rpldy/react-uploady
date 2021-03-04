import React, { useRef } from "react";
import usePasteHandler from "../usePasteHandler";
import usePasteUpload from "../usePasteUpload";

jest.mock("../usePasteHandler");

describe("usePasteUpload hook tests", () => {

    it("should register paste handler on Window", () => {
        const onPaste = jest.fn(),
            onPasteUpload = jest.fn();

        usePasteHandler.mockReturnValueOnce(onPaste);

        const uploadOptions = { autoUpload: true };

        const {
            getHookResult,
        } = testCustomHook(usePasteUpload, () => [uploadOptions, undefined, onPasteUpload]);

        const { getIsEnabled } = getHookResult();

        expect(getIsEnabled()).toBe(true);

        window.dispatchEvent(new CustomEvent("paste", {
            test: "paste"
        }));

        expect(onPaste).toHaveBeenCalled();

        expect(usePasteHandler).toHaveBeenCalledWith(uploadOptions, onPasteUpload);
    });

    it("should toggle listener on/off", () => {
        const onPaste = jest.fn();

        usePasteHandler.mockReturnValueOnce(onPaste);

        const {
            getHookResult,
        } = testCustomHook(usePasteUpload, () => []);

        const { toggle, getIsEnabled } = getHookResult();

        window.dispatchEvent(new CustomEvent("paste", {
            test: "paste"
        }));

        const toggleResult = toggle();
        expect(toggleResult).toBe(false);
        expect(getIsEnabled()).toBe(false);

        window.dispatchEvent(new CustomEvent("paste", {
            test: "paste"
        }));

        const toggleResult2 = toggle();
        expect(toggleResult2).toBe(true);
        expect(getIsEnabled()).toBe(true);

        window.dispatchEvent(new CustomEvent("paste", {
            test: "paste"
        }));

        expect(onPaste).toHaveBeenCalledTimes(2);
    });

    it("should unregister listener on unmount", () => {
        const onPaste = jest.fn();

        usePasteHandler.mockReturnValueOnce(onPaste);

        const {
            wrapper,
        } = testCustomHook(usePasteUpload, () => []);

        window.dispatchEvent(new CustomEvent("paste", {
            test: "paste"
        }));

        wrapper.unmount();

        window.dispatchEvent(new CustomEvent("paste", {
            test: "paste"
        }));

        expect(onPaste).toHaveBeenCalledTimes(1);
    });

    it("should register listener to element", () => {
        const onPaste = jest.fn();

        usePasteHandler.mockReturnValueOnce(onPaste);

        const ElementPaste = (props) => {
            const containerRef = useRef(null);

            usePasteUpload(props, containerRef);

            return <>
                <div id="paste-div" ref={containerRef}>
                    Click here & Paste a file
                </div>
            </>;
        };

        const wrapper = mount(<ElementPaste/>);
        const div = wrapper.find("#paste-div").getDOMNode();

        div.dispatchEvent(new CustomEvent("paste", {
            test: "paste"
        }));

        wrapper.unmount();

        div.dispatchEvent(new CustomEvent("paste", {
            test: "paste"
        }));

        expect(onPaste).toHaveBeenCalledTimes(1);
    });

    it("should not unregister listener if already off", () => {
        const onPaste = jest.fn();

        usePasteHandler.mockReturnValueOnce(onPaste);

        const addEventListener = jest.fn(),
            removeEventListener = jest.fn();

        const elm = {
            current: {
                addEventListener,
                removeEventListener
            }
        };

        const {
            wrapper,
            getHookResult,
        } = testCustomHook(usePasteUpload, () => [undefined, elm]);

        const { toggle } = getHookResult();

        toggle();

        wrapper.setProps({ test: true });
        wrapper.unmount();

        expect(addEventListener).toHaveBeenCalledTimes(1);
        expect(removeEventListener).toHaveBeenCalledTimes(1);
    });
});
