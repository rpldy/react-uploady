import React  from "react";
import { getFilesFromDragEvent } from "html-dir-content";
import { UploadyContext } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import UploadDropZone from "./UploadDropZone";

jest.mock("html-dir-content", () => ({
    getFilesFromDragEvent: jest.fn()
}));

describe("UploadDropZone tests", () => {
    beforeEach(() => {
        clearJestMocks(
            UploadyContext.upload,
            getFilesFromDragEvent,
        );
    });

    const testDropZone = (props = {}, doDragEnter = true ) => {
        const mockRef = jest.fn();

        const wrapper = mount(
            <UploadDropZone
                {...props}
                ref={mockRef}
            >
                <span>test</span>
            </UploadDropZone>
        );

        const div = wrapper.find("div");
        const span = wrapper.find("span");

        const dropEvent = {
            dataTransfer: {},
            preventDefault: () => {
            },
            persist: () => {
            },
        };

        const dragEvent = { target: div.getDOMNode() };

        if (doDragEnter) {
            div.props().onDragEnter(dragEvent);
        }

        return {
            wrapper,
            div,
            dropEvent,
            dragEvent,
            mockRef,
            span,
        };
    };

    it("should render drop zone & handle drop", async () => {
        const { div, dropEvent } = testDropZone({
            id: "testZone",
            className: "test-zone",
            autoUpload: true,
        });

        expect(div).toHaveProp("id", "testZone");
        expect(div).toHaveProp("className", "test-zone");

        expect(div.find("span")).toHaveText("test");

        const files = [1, 2];
        getFilesFromDragEvent.mockResolvedValueOnce(files);

        await div.props().onDrop(dropEvent);

        expect(getFilesFromDragEvent).toHaveBeenCalledWith(
            dropEvent,
            {}
        );

        expect(UploadyContext.upload)
            .toHaveBeenCalledWith(files, {
                autoUpload: true
            });
    });

    it("should pass htmlDirContentParams", async () => {
        const htmlDirParams = { recursive: true };

        const { div, dropEvent } = testDropZone({
            htmlDirContentParams: htmlDirParams
        });

        getFilesFromDragEvent.mockResolvedValueOnce([1, 2]);

        await div.props().onDrop(dropEvent);

        expect(getFilesFromDragEvent).toHaveBeenCalledWith(
            dropEvent,
            htmlDirParams
        );
    });

    it("should use provided drop handler", async () => {
        const files = [1, 2];
        const dropHandler = jest.fn(() => files);

        const { div, dropEvent } = testDropZone({
            autoUpload: true,
            dropHandler,
        });

        await div.props().onDrop(dropEvent);

        expect(getFilesFromDragEvent).not.toHaveBeenCalled();

        expect(dropHandler).toHaveBeenCalledWith(dropEvent, expect.any(Function));

        expect(UploadyContext.upload)
            .toHaveBeenCalledWith(files, {
                autoUpload: true
            });
    });

    it("should getFiles in drop handler", async () => {
        const dropHandler = (e, getFiles) => {
            const files = getFiles();
            return files.slice(0, 1);
        };

        const files = [1, 2];
        getFilesFromDragEvent.mockReturnValueOnce(files);

        const { div, dropEvent } = testDropZone({
            autoUpload: true,
            dropHandler,
        });

        await div.props().onDrop(dropEvent);

        expect(getFilesFromDragEvent).toHaveBeenCalled();

        expect(UploadyContext.upload)
            .toHaveBeenCalledWith([1], {
                autoUpload: true
            });
    });

    it("should add & remove drag className", () => {
        const onDragOverClassName = "drag-over";

        const { div, span, mockRef } = testDropZone({
            onDragOverClassName
        }, false);

        const refElm = mockRef.mock.calls[0][0];

        div.simulate("dragenter");
        div.simulate("dragover");
        expect(refElm.classList.contains("drag-over")).toBe(true);
        div.simulate("dragend");
        expect(refElm.classList.contains("drag-over")).toBe(false);

        div.simulate("dragenter");

        //simulate drag is over child element
        span.simulate("dragenter");
        div.simulate("dragleave");

        expect(refElm.classList.contains("drag-over")).toBe(true);
        div.simulate("dragenter");
        div.simulate("dragleave");
        expect(refElm.classList.contains("drag-over")).toBe(false);
    });

    it("should not remove drag className if different element", () => {
        const onDragOverClassName = "drag-over";

        const { div, span, mockRef } = testDropZone({
            onDragOverClassName,
        }, false);

        const refElm = mockRef.mock.calls[0][0];

        div.simulate("dragenter");
        div.simulate("dragover");
        expect(refElm.classList.contains("drag-over")).toBe(true);
        div.simulate("dragend");
        expect(refElm.classList.contains("drag-over")).toBe(false);

        div.simulate("dragenter");

        //simulate drag is over child element
        span.simulate("dragenter");
        span.simulate("dragLeave");
        expect(refElm.classList.contains("drag-over")).toBe(true);
    });

    it("should add & remove drag className with shouldRemoveDragOver callback", () => {
        const onDragOverClassName = "drag-over";

        const { div, span, mockRef } = testDropZone({
            onDragOverClassName,
            shouldRemoveDragOver: ({ target }) => target === span.getDOMNode(),
        }, false);

        const refElm = mockRef.mock.calls[0][0];

        div.simulate("dragenter");
        div.simulate("dragover");
        expect(refElm.classList.contains("drag-over")).toBe(true);
        div.simulate("dragend");
        expect(refElm.classList.contains("drag-over")).toBe(false);

        div.simulate("dragenter");

        //simulate drag is over child element
        span.simulate("dragenter");
        span.simulate("dragLeave");
        expect(refElm.classList.contains("drag-over")).toBe(false);
    });

    it("should not add className if non provided", () => {
        const { div, mockRef } = testDropZone();

        const refElm = mockRef.mock.calls[0][0];

        div.simulate("dragenter");
        div.simulate("dragover");
        expect(refElm.classList.contains("drag-over")).toBe(false);
    });

    describe("shouldHandleDrag tests", () => {
        it("should not handle drop when shouldHandleDrag is false", async () => {
            const { div, dropEvent } = testDropZone({
                shouldHandleDrag: false,
            });

            await div.props().onDrop(dropEvent);
            expect(getFilesFromDragEvent).not.toHaveBeenCalled();
            expect(UploadyContext.upload).not.toHaveBeenCalled();
        });

        it("should not handle drop when shouldHandleDrag is fn returning falsy", async () => {
            const { div, dropEvent } = testDropZone({
                shouldHandleDrag: () => null,
            });

            await div.props().onDrop(dropEvent);
            expect(getFilesFromDragEvent).not.toHaveBeenCalled();
            expect(UploadyContext.upload).not.toHaveBeenCalled();
        });

        it("should handle drop when shouldHandleDrag is fn returning truthy", async () => {
            const { div, dropEvent } = testDropZone({
                shouldHandleDrag: () => 1,
            });

            const files = [1, 2];
            getFilesFromDragEvent.mockResolvedValueOnce(files);

            await div.props().onDrop(dropEvent);

            expect(getFilesFromDragEvent).toHaveBeenCalled();
            expect(UploadyContext.upload).toHaveBeenCalled();
        });
    });
});
