import { createUploader, uploader } from "@rpldy/uploader/src/tests/mocks/rpldy-uploader.mock";
import useUploader from "../useUploader";

describe("useUploader tests", () => {

    beforeEach(() => {
        clearJestMocks(
            uploader.update,
            uploader.on,
            uploader.off,
        );
    });

    it("should create uploader", () => {

        const options = {
            multiple: true,
            autoUpload: true,
            enhancer: "123",
        };

        const { wrapper, getHookResult } = testCustomHook(useUploader, options);

        expect(getHookResult()).toBe(uploader);

        expect(createUploader).toHaveBeenCalledWith(options);
        expect(uploader.update).toHaveBeenCalledWith(options);
        expect(uploader.on).not.toHaveBeenCalled();

        const changedProps = { inputFieldName: "aaaa" };
        wrapper.setProps(changedProps);
        expect(uploader.update).toHaveBeenCalledWith({
            ...options,
            ...changedProps,
        });

        expect(createUploader).toHaveBeenCalledTimes(1);

        wrapper.setProps(({ multiple: false, enhancer: true }));
        expect(createUploader).toHaveBeenCalledTimes(2);

        expect(uploader.update).toHaveBeenCalledWith({
            ...options,
            ...changedProps,
            enhancer: true,
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

        const { wrapper } = testCustomHook(useUploader, () => [  {autoUpload: true }, listeners]);

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
});
