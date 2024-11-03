/**
 * @vitest-environment-options { "url": "https://test.com/home/test.html" }
 */
import React, { useRef } from "react";
import { waitFor } from "@testing-library/react";
import { UploadyContext } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import useFileInput from "../useFileInput";

describe("useFileInput tests", () => {
    const url = "test.com/upload";

    beforeEach(() => {
        UploadyContext.setOptions.mockClear();
    });

    const TestComp = ({ withForm, withoutRef, formNoProps, exposeRef, action }) => {
        const inputRef = useRef();
        useFileInput(inputRef);

        exposeRef(inputRef);

        return withForm ?
            <form action={formNoProps ? undefined : (action === undefined ? url : action)}
                  method={formNoProps ? undefined : "put"}>
                <input type="file" name="testFile" style={{ display: "none" }}
                       ref={withoutRef ? undefined : inputRef}/>
            </form> :
            <input type="file" name="testFile" style={{ display: "none" }}
                   ref={withoutRef ? undefined : inputRef}/>;
    };

    const renderTestComp = (options) => {
        let inputRef;
        const exposeRef = (ref) => {
            inputRef = ref;
        };

        const renderResult = render(<TestComp {...options} exposeRef={exposeRef}/>);

        const reRender = (newOpts) =>
            renderResult.rerender(<TestComp {...options} {...newOpts} exposeRef={exposeRef}/>);

        return {
            renderResult,
            inputRef,
            reRender,
        };
    };

    it("should pass input ref to Uploady context", () => {
        UploadyContext.getOptions.mockReturnValueOnce({});

        const { inputRef } = renderTestComp();

        expect(UploadyContext.setExternalFileInput)
            .toHaveBeenCalledWith(inputRef);

        expect(UploadyContext.setOptions)
            .toHaveBeenCalledWith({
                destination: {
                    filesParamName: "testFile",
                    method: undefined,
                    url: undefined,
                }
            });
    });

    describe("test with form action", () => {
        const pageUrl = "https://test.com/home/test.html";

        it.each([
            ["", pageUrl],
            ["  ", pageUrl],
            ["upload", "https://test.com/home/upload"],
            ["/upload", "https://test.com/upload"],
            ["https://my-upload.com", "https://my-upload.com"],
        ])("should pass destination props from input form for action: '%s'", (formAction, resultUrl) => {
            UploadyContext.getOptions.mockReturnValueOnce({});

            const { inputRef } = renderTestComp({ withForm: true, action: formAction });

            expect(UploadyContext.setExternalFileInput)
                .toHaveBeenCalledWith(inputRef);

            expect(UploadyContext.setOptions)
                .toHaveBeenCalledWith({
                    destination: {
                        filesParamName: "testFile",
                        method: "PUT",
                        url: resultUrl,
                    }
                });
        });

        it.each([
            ["https://test.com/bbb", "https://test.com/bbb"],
            ["", pageUrl],
        ])("should update context destination when action attribute changes to: '%s'", async (formAction, resultUrl) => {
            UploadyContext.getOptions.mockReturnValueOnce({});

            const { inputRef, reRender } = renderTestComp({ withForm: true, action: "https://test.com/aaa" });

            expect(UploadyContext.setExternalFileInput)
                .toHaveBeenCalledWith(inputRef);

            expect(UploadyContext.setOptions)
                .toHaveBeenCalledWith({
                    destination: {
                        filesParamName: "testFile",
                        method: "PUT",
                        url: "https://test.com/aaa",
                    }
                });

            reRender({ action: formAction });

            await waitFor(() => {
                expect(UploadyContext.setOptions)
                    .toHaveBeenCalledWith({
                        destination: {
                            filesParamName: "testFile",
                            method: "PUT",
                            url: resultUrl
                        }
                    });
            });
        });
    });

    it("should not pass form destination props if destination in options", () => {
        UploadyContext.getOptions.mockReturnValueOnce({
            destination: { url: "somewhere.com" }
        });

        const { inputRef } = renderTestComp({ withForm: true });

        expect(UploadyContext.setExternalFileInput)
            .toHaveBeenCalledWith(inputRef);

        expect(UploadyContext.setOptions)
            .not.toHaveBeenCalled();
    });

    it("should pass undefined if no form attributes", () => {
        UploadyContext.getOptions.mockReturnValueOnce({});

        renderTestComp({ withForm: true, formNoProps: true });

        expect(UploadyContext.setOptions)
            .toHaveBeenCalledWith({
                destination: {
                    filesParamName: "testFile",
                    method: undefined,
                    url: "https://test.com/home/test.html",
                }
            });
    });

    it("should cope with no input ref", () => {
        renderTestComp({ withoutRef: true });

        expect(UploadyContext.setOptions)
            .not.toHaveBeenCalled();
    });

    it("should return context internal input if no params passed", async () => {
        const TestCompNoParam = () => {
            const fileInput = useFileInput();

            return <div>{fileInput}</div>;
        };

        UploadyContext.getInternalFileInput.mockReturnValueOnce("file input");

        const { findByText } = render(<TestCompNoParam/>);
        const div = await findByText("file input");
        expect(div).toBeDefined();
    });
});
