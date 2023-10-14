import React, { useRef } from "react";
import usePasteHandler from "../usePasteHandler";
import usePasteUpload from "../usePasteUpload";

vi.mock("../usePasteHandler");

describe("usePasteUpload hook tests", () => {
    it("should register paste handler on Window", () => {
        const onPaste = vi.fn(),
            onPasteUpload = vi.fn();

        usePasteHandler.mockReturnValueOnce(onPaste);

        const uploadOptions = { autoUpload: true };

        const { result } = renderHook(() =>
            usePasteUpload(uploadOptions, undefined, onPasteUpload));

        const { getIsEnabled } = result.current;

        expect(getIsEnabled()).toBe(true);

        window.dispatchEvent(new CustomEvent("paste", {
            test: "paste"
        }));

        expect(onPaste).toHaveBeenCalled();

        expect(usePasteHandler).toHaveBeenCalledWith(uploadOptions, onPasteUpload);
    });

    it("should toggle listener on/off", () => {
        const onPaste = vi.fn();

        usePasteHandler.mockReturnValueOnce(onPaste);

        const { result } = renderHook(usePasteUpload);

        const { toggle, getIsEnabled } = result.current;

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
        const onPaste = vi.fn();

        usePasteHandler.mockReturnValueOnce(onPaste);

        const { unmount } = renderHook(usePasteUpload);

        window.dispatchEvent(new CustomEvent("paste", {
            test: "paste"
        }));

        unmount();

        window.dispatchEvent(new CustomEvent("paste", {
            test: "paste"
        }));

        expect(onPaste).toHaveBeenCalledTimes(1);
    });

    it("should register listener to element", () => {
        const onPaste = vi.fn();

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

        const { unmount } = render(<ElementPaste/>);
        const div = document.getElementById("paste-div");

        div.dispatchEvent(new CustomEvent("paste", {
            test: "paste"
        }));

        unmount();

        div.dispatchEvent(new CustomEvent("paste", {
            test: "paste"
        }));

        expect(onPaste).toHaveBeenCalledOnce();
    });

    it("should not unregister listener if already off", () => {
        const onPaste = vi.fn();

        usePasteHandler.mockReturnValueOnce(onPaste);

        const addEventListener = vi.fn(),
            removeEventListener = vi.fn();

        const elm = {
            current: {
                addEventListener,
                removeEventListener
            }
        };

        const {
            result,
            rerender,
            unmount,
        } = renderHook((props) => usePasteUpload(...[].concat(props || [undefined, elm])));

        const { toggle } = result.current;

        toggle();

        rerender([undefined, elm]);
        unmount();

        expect(addEventListener).toHaveBeenCalledTimes(1);
        expect(removeEventListener).toHaveBeenCalledTimes(1);
    });
});
