import React from "react";
import { getIsUploadOptionsComponent } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import usePasteHandler from "../usePasteHandler";
import withPasteUpload from "../withPasteUpload";

jest.mock("../usePasteHandler");

describe("withPasteUpload HOC tests", () => {
    const MyComp = () => {
        return <div/>;
    };

    it("should add paste listener", () => {
        const onPasteUpload = jest.fn();
        const onPaste = jest.fn();

        usePasteHandler.mockReturnValueOnce(onPaste);

        const PasteArea = withPasteUpload(MyComp);

        const wrapper = mount(<PasteArea onPasteUpload={onPasteUpload} id="paste-area">
            Click here & Paste a file
        </PasteArea>);

        wrapper.find(MyComp).props().onPaste();

        expect(onPaste).toHaveBeenCalled();
    });

    it("should pass upload options for Uploady input component", () => {

        getIsUploadOptionsComponent.mockReturnValueOnce(true);

        const onPasteUpload = jest.fn();
        const onPaste = jest.fn();

        usePasteHandler.mockReturnValueOnce(onPaste);

        const PasteArea = withPasteUpload(MyComp);

        const wrapper = mount(<PasteArea onPasteUpload={onPasteUpload} id="paste-area" autoUpload>
            Click here & Paste a file
        </PasteArea>);

        wrapper.find(MyComp).props().extraProps.onPaste();
        expect(onPaste).toHaveBeenCalled();

        expect(wrapper.find(MyComp)).toHaveProp("autoUpload", true);
    });
});
