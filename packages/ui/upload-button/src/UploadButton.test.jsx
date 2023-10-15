import React from "react";
import { UploadyContext } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import UploadButton from "./UploadButton";

describe("<UploadButton> tests", () => {
    it("should render button with defaults", () => {
        const { container } = render(<UploadButton
            id={"test"}
            className={"styles"}
        />);

        const elm = container.firstChild;
        expect(elm).to.have.attr("id", "test");
        expect(elm).to.have.attr("class", "styles");
        expect(elm).to.have.text("Upload");
    });

    it("should show file upload on click", async () => {
        const user = userEvent.setup();

        const { container } = render(<UploadButton
            multiple
            autoUpload
        />);

        await user.click(container.firstChild);

        expect(UploadyContext.showFileUpload).toHaveBeenCalledWith({
            multiple: true,
            autoUpload: true,
        });
    });

    it("should render custom children", () => {
        const { getByTestId, container } = render(<UploadButton text="test">
            <div data-testid="test-div">custom</div>
        </UploadButton>);

        const div = getByTestId("test-div");
        expect(div).to.be.instanceof(HTMLDivElement);
        expect(div).to.have.text("custom");
        expect(container.firstChild).not.to.have.text("Upload");
        expect(container.firstChild).not.to.have.text("test");
    });

    it("should render custom text", () => {
        const {  container } = render(<UploadButton text="test"/>);
        expect(container.firstChild).to.have.text("test");
    });

    it("should call onClick", async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();

        const { container } = render(<UploadButton text="test" onClick={onClick}>
            <div>custom</div>
        </UploadButton>);

        await user.click(container.firstChild);

        expect(UploadyContext.showFileUpload).toHaveBeenCalled();
        expect(onClick).toHaveBeenCalled();
    });
});
