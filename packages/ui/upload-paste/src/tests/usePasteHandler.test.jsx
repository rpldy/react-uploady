import { UploadyContext } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import usePasteHandler from "../usePasteHandler";

describe("usePasteHandler hook tests", () => {
    beforeEach(() => {
        clearViMocks(UploadyContext.upload);
    });

    it("should upload file on handler called", () => {
        const uploadOptions = { autoUpload: true };
        const onPasteUpload = vi.fn();

        const { result } = renderHook(() =>
            usePasteHandler(uploadOptions, onPasteUpload));

        const pasteHandler = result.current;

        const files = [1, 2, 3];

        pasteHandler({ clipboardData: { files } });

        expect(UploadyContext.upload).toHaveBeenCalledWith(files, uploadOptions);

        expect(onPasteUpload).toHaveBeenCalledWith({ count: 3 });
    });

    it.each([
        null,
        { files: null },
        { files: [] }
    ])("should not call upload if no files %s", (clipboardData) => {
        const onPasteUpload = vi.fn();

        const { result } = renderHook(() =>
            usePasteHandler(undefined, onPasteUpload));

        const pasteHandler = result.current;

        pasteHandler({ clipboardData });

        expect(UploadyContext.upload).not.toHaveBeenCalled();
        expect(onPasteUpload).not.toHaveBeenCalled();
    });
});
