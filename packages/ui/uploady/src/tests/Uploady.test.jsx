import React from "react";
import { invariant } from "@rpldy/shared/src/tests/mocks/rpldy-shared.mock";
import { hasWindow } from "@rpldy/shared";
import {
    useUploadOptions,
} from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import Uploady from "../Uploady";

describe("Uploady tests", () => {
    beforeEach(() => {

        useUploadOptions.mockClear();
        invariant.mockClear();
    });

    it("should render Uploady successfully", () => {
        hasWindow.mockReturnValueOnce(true);

        useUploadOptions.mockReturnValueOnce({
            inputFieldName: "file",
        });

        const listeners = [1, 2, 3];
        const { container } = render(<Uploady
            debug
            accept={".doc"}
            capture="user"
            multiple
            listeners={listeners}
            autoUpload
            fileInputId="uploadyInput"
        >
            <div id="test"/>
        </Uploady>);

        expect(container.querySelector("#test")).toBeInstanceOf(HTMLDivElement)

        const input = document.getElementById("uploadyInput");

        expect(input).toBeInstanceOf(HTMLInputElement);
        expect(input).to.have.attr("multiple");
        expect(input).to.have.attr("name", "file");
        expect(input).to.have.attr("capture", "user");
        expect(input).to.have.attr("accept", ".doc");
    });

    it("should use provided container for file input", () => {
        useUploadOptions.mockReturnValueOnce({
            inputFieldName: "file",
        });

        const div = document.createElement("div");
        document.body.appendChild(div);

        render(<Uploady inputFieldContainer={div} fileInputId="uploadyInput"/>);

        expect(invariant).toHaveBeenCalledWith(
            true,
            expect.any(String)
        );

        const input = document.getElementById("uploadyInput");

        expect(input).toBeInstanceOf(HTMLInputElement);
        expect(div).to.contain(input);
    });

    it("should show error in case no valid container", () => {
        hasWindow.mockReturnValueOnce(true);

        useUploadOptions.mockReturnValueOnce({
            inputFieldContainer: true,
        });

        render(<Uploady inputFieldContainer/>);

        expect(invariant).toHaveBeenCalledWith(
            false,
            expect.any(String)
        );
    });

    it("should work with customInput", () => {
        render(<Uploady
            customInput
            fileInputId="uploadyInput"
        />);

        const input = document.getElementById("uploadyInput");
        expect(input).toBeNull();
    });

    it("should respect noPortal", () => {
        useUploadOptions.mockReturnValueOnce({
            inputFieldName: "file",
        });

        const wrapper = render(<Uploady
            noPortal
            multiple
            accept={".doc"}
        >
            <div id="test"/>
        </Uploady>);

        expect(wrapper.find("Portal").find("input")).toHaveLength(0);

        const input = wrapper.find("input");
        expect(input).toHaveLength(1);
        expect(input).toHaveProp("multiple", true);
        expect(input).toHaveProp("name", "file");
    });
});
