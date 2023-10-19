import React from "react";
import { fireEvent, createEvent } from "@testing-library/react";
import { getIsUploadOptionsComponent } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import usePasteHandler from "../usePasteHandler";
import withPasteUpload from "../withPasteUpload";

vi.mock("../usePasteHandler");

describe("withPasteUpload HOC tests", () => {
    const MyComp = ({ onPaste, autoUpload }) => {
        return <div id="paste-elm" onPaste={onPaste} data-auto={autoUpload}/>;
    };

    const firePasteEvent = () => {
        const pasteElm = document.getElementById("paste-elm");

        const pasteEvent = createEvent.paste(pasteElm, {
            clipboardData: {
                getData: () => "123456",
            },
        });

        fireEvent(pasteElm, pasteEvent);

        return { elm: pasteElm };
    };

    it("should add paste listener", () => {
        const onPasteUpload = vi.fn();
        const onPaste = vi.fn();
        // const user = userEvent.setup();

        usePasteHandler.mockReturnValueOnce(onPaste);

        const PasteArea = withPasteUpload(MyComp);

        render(<PasteArea onPasteUpload={onPasteUpload} id="paste-area">
            Click here & Paste a file
        </PasteArea>);

        firePasteEvent();

        expect(onPaste).toHaveBeenCalled();
    });

    it("should pass upload options for Uploady input component", () => {
        getIsUploadOptionsComponent.mockReturnValueOnce(true);

        const onPasteUpload = vi.fn();
        const onPaste = vi.fn();

        usePasteHandler.mockReturnValueOnce(onPaste);

        const PasteArea = withPasteUpload(MyComp);

        render(<PasteArea onPasteUpload={onPasteUpload} id="paste-area" autoUpload>
            Click here & Paste a file
        </PasteArea>);

        const { elm } = firePasteEvent();

        expect(elm).to.have.attr("data-auto", "true");
    });
});
