import { createUploader, uploader } from "@rpldy/uploader/src/tests/mocks/rpldy-uploader.mock";
import useUploader from "../useUploader";

describe("useUploader tests", () => {
    beforeEach(() => {
        clearViMocks(
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

        const { result, rerender, unmount } = renderHook(useUploader, { initialProps: options });

        expect(result.current).toBe(uploader);

        expect(createUploader).toHaveBeenCalledWith(options);
        expect(uploader.update).toHaveBeenCalledWith(options);
        expect(uploader.on).not.toHaveBeenCalled();

        const newProps = { ...options, inputFieldName: "aaaa" };
        rerender(newProps);

        expect(uploader.update).toHaveBeenCalledWith(newProps);
        expect(createUploader).toHaveBeenCalledTimes(1);

        rerender({ ...newProps, multiple: false, enhancer: true });

        expect(createUploader).toHaveBeenCalledTimes(2);

        expect(uploader.update).toHaveBeenCalledWith({
            ...newProps,
            enhancer: true,
            multiple: false,
        });

        unmount();
        expect(uploader.off).not.toHaveBeenCalled();
    });

    it("should render Uploady with listeners", () => {
        const listeners = {
            a: "111",
            b: "222"
        };

        const props = [{ autoUpload: true }, listeners];

        const { result, rerender, unmount } = renderHook((props) =>
            useUploader(...props), { initialProps: props });

        const uploader = result.current;

        expect(uploader.update).toHaveBeenCalledWith({ autoUpload: true });

        expect(uploader.on).toHaveBeenCalledWith("a", listeners.a);
        expect(uploader.on).toHaveBeenCalledWith("b", listeners.b);

        rerender(props);
        expect(uploader.on).toHaveBeenCalledTimes(2);
        expect(uploader.off).not.toHaveBeenCalled();

        unmount();

        expect(uploader.off).toHaveBeenCalledWith("a", listeners.a);
        expect(uploader.off).toHaveBeenCalledWith("b", listeners.b);
    });
});
