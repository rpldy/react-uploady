import React, { forwardRef } from "react";
import { UploadyContext } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import asUploadButton from "./asUploadButton";

describe("asUploadButton tests", () => {
    const DivUploadButton = asUploadButton(forwardRef(
        (props) =>
            <div {...props} style={{ cursor: "pointer" }}>
                DIV Upload Button
            </div>
    ));

    it("should render button with defaults", () => {
        const { container } = render(<DivUploadButton
            id={"test"}
            className={"styles"}
        />);

        const elm = container.firstChild;
        expect(elm).to.have.attr("id", "test");
        expect(elm).to.have.attr("class", "styles");
        expect(elm).to.have.text("DIV Upload Button");
    });

    it("should show file upload on click", async () => {
        const user = userEvent.setup();

        const { container } = render(<DivUploadButton
            multiple
            autoUpload
        />);

        await user.click(container.firstChild);

        expect(UploadyContext.showFileUpload).toHaveBeenCalledWith({
            multiple: true,
            autoUpload: true,
        });
    });

    it("should call onClick", async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();

        const { container } = render(<DivUploadButton onClick={onClick}/>);

        await user.click(container.firstChild);

        expect(UploadyContext.showFileUpload).toHaveBeenCalled();
        expect(onClick).toHaveBeenCalled();
    });

    it("should cope with no onClick", async () => {
        const user = userEvent.setup();

        const { container } = render(<DivUploadButton />);

        await user.click(container.firstChild);

        expect(UploadyContext.showFileUpload).toHaveBeenCalled();
    });
});
