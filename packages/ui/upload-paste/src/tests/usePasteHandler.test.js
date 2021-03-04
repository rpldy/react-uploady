import { UploadyContext } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import usePasteHandler from "../usePasteHandler";

describe("usePasteHandler hook tests", () => {

    beforeEach(() => {
        clearJestMocks(UploadyContext.upload);
    });

    it("should upload file on handler called", () => {

        const uploadOptions = { autoUpload: true };
        const onPasteUpload = jest.fn();

        const { getHookResult } = testCustomHook(usePasteHandler, () => [
            uploadOptions,
            onPasteUpload,
        ]);

        const pasteHandler = getHookResult();

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
        const onPasteUpload = jest.fn();

        const { getHookResult } = testCustomHook(usePasteHandler, () => [
            undefined,
            onPasteUpload,
        ]);

        const pasteHandler = getHookResult();

        pasteHandler({ clipboardData });

        expect(UploadyContext.upload).not.toHaveBeenCalled();

        expect(onPasteUpload).not.toHaveBeenCalled();
    });
});
