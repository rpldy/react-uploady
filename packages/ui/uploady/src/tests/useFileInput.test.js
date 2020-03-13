import React, { useRef } from "react";
import { UploadyContext } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import useFileInput from "../useFileInput";

describe("useFileInput tests", () => {

    const url = "test.com/upload";

    beforeEach(() => {
        clearJestMocks(
            UploadyContext.setOptions
        );
    });

    const TestComp = ({ withForm, withoutRef, formNoProps, exposeRef }) => {
        const inputRef = useRef();
        useFileInput(inputRef);

        exposeRef(inputRef);

        return withForm ?
            <form action={formNoProps ? undefined : url} method={formNoProps ? undefined : "put"}>
                <input type="file" name="testFile" style={{ display: "none" }}
                       ref={withoutRef ? undefined : inputRef}/>
            </form> :
            <input type="file" name="testFile" style={{ display: "none" }}
                   ref={withoutRef ? undefined : inputRef}/>
    };

    const renderTestComp = (options) => {
        let inputRef;
        const exposeRef = (ref) => {
            inputRef = ref;
        };

        const wrapper = mount(<TestComp {...options} exposeRef={exposeRef}/>);

        return {
            wrapper,
            inputRef,
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

    it("should pass destination props from input form", () => {

        UploadyContext.getOptions.mockReturnValueOnce({});

        const { inputRef } = renderTestComp({ withForm: true });

        expect(UploadyContext.setExternalFileInput)
            .toHaveBeenCalledWith(inputRef);

        expect(UploadyContext.setOptions)
            .toHaveBeenCalledWith({
                destination: {
                    filesParamName: "testFile",
                    method: "PUT",
                    url,
                }
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

        renderTestComp({ withForm: true , formNoProps: true});

        expect(UploadyContext.setOptions)
            .toHaveBeenCalledWith({
                destination: {
                    filesParamName: "testFile",
                    method: undefined,
                    url: undefined,
                }
            });
    });

    it("should cope with no input ref", () => {
        renderTestComp({ withoutRef: true });

        expect(UploadyContext.setOptions)
            .not.toHaveBeenCalled();
    });
});
