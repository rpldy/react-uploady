import React from "react";
import { createUploader, uploader } from "@rpldy/uploader/src/tests/mocks/rpldy-uploader.mock";
import useUploader from "../useUploader";
import testCustomHook from "test/testCustomHook";

describe("useUploader tests", () => {

    beforeEach(() => {
        clearJestMocks(
            uploader.update,
            uploader.on,
            uploader.off,
        )
    });

    it("should create uploader", () => {

        const options = {
            multiple: true,
            autoUpload: true,
        };

        const enhancer = "123";

        const { wrapper, hookResult } = testCustomHook(useUploader,
            {
                ...options,
                enhancer,
            });

        expect(hookResult).toBe(uploader);

        expect(createUploader).toHaveBeenCalledWith(options, enhancer);
        expect(uploader.update).toHaveBeenCalledWith(options);
        expect(uploader.on).not.toHaveBeenCalled();

        wrapper.setProps({});
        expect(uploader.update).toHaveBeenCalledTimes(1);

        const changedProps = { inputFieldName: "aaaa" };
        wrapper.setProps(changedProps);
        expect(uploader.update).toHaveBeenCalledWith({
            ...options,
            ...changedProps,
        });

        expect(createUploader).toHaveBeenCalledTimes(1);

        wrapper.setProps(({ multiple: false }));
        expect(uploader.update).toHaveBeenCalledWith({
            ...options,
            ...changedProps,
            multiple: false,
        });

        wrapper.unmount();

        expect(uploader.off).not.toHaveBeenCalled();
    });

    it("should render Uploady with listeners", () => {

        const listeners = {
            a: "111",
            b: "222"
        };

        const { wrapper } = testCustomHook(useUploader, { listeners, autoUpload: true });

        expect(uploader.update).toHaveBeenCalledWith({ autoUpload: true });

        expect(uploader.on).toHaveBeenCalledWith("a", listeners.a);
        expect(uploader.on).toHaveBeenCalledWith("b", listeners.b);

        wrapper.setProps({});
        expect(uploader.on).toHaveBeenCalledTimes(2);
        expect(uploader.off).not.toHaveBeenCalled();

        wrapper.unmount();

        expect(uploader.off).toHaveBeenCalledWith("a", listeners.a);
        expect(uploader.off).toHaveBeenCalledWith("b", listeners.b);

    });

    it("should accept uploader from outside", () => {

        const customUploader = { custom: true, update: jest.fn() };

        const {  hookResult } = testCustomHook(useUploader, {
            uploader: customUploader,
            autoUpload: true
        });

        expect(hookResult).toBe(customUploader);
        expect(customUploader.update).toHaveBeenCalledWith({ autoUpload: true });
    });
});
