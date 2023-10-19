import React from "react";
import { fireEvent, createEvent, waitFor } from "@testing-library/react";
import { getFilesFromDragEvent } from "html-dir-content";
import { UploadyContext } from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import UploadDropZone from "./UploadDropZone";

vi.mock("html-dir-content");

describe("UploadDropZone tests", () => {
    const dropEvent = {
        clipboardData: {
            getData: () => "123456",
        },
    };

    beforeEach(() => {
        clearViMocks(
            UploadyContext.upload,
            getFilesFromDragEvent,
        );
    });

    const getDropEvent = (elm) =>
        () =>
            fireEvent(elm, createEvent.drop(elm, dropEvent));

    const getDragEnterEvent = (elm) =>
        () =>
            fireEvent(elm, createEvent.dragEnter(elm, {}));

    const getDragOverEvent = (elm) =>
        () =>
            fireEvent(elm, createEvent.dragOver(elm, {}));

    const getDragEndEvent = (elm) =>
        () =>
            fireEvent(elm, createEvent.dragEnd(elm, {}));

    const getDragLeaveEvent = (elm) =>
        () =>
            fireEvent(elm, createEvent.dragLeave(elm, {}));

    const testDropZone = (props = {}, doDragEnter = true) => {
        const mockRef = vi.fn();
        const id = props.id || "drop-zone";

        render(
            <UploadDropZone
                id={id}
                {...props}
                ref={mockRef}
            >
                <span>test</span>
            </UploadDropZone>
        );

        const div = document.getElementById("drop-zone");
        const span = div.querySelector("span");

        const fireDragEnter = getDragEnterEvent(div);
        if (doDragEnter) {
            fireDragEnter();
        }

        return {
            div,
            fireDrop: getDropEvent(div),
            fireDragEnter,
            fireDragOver: getDragOverEvent(div),
            fireDragEnd: getDragEndEvent(div),
            fireDragLeave: getDragLeaveEvent(div),
            mockRef,
            span,
            id,
        };
    };

    it("should render drop zone & handle drop", async () => {
        const { div, id, span, fireDrop } = testDropZone({
            className: "test-zone",
            autoUpload: true,
        });

        expect(div).to.have.attr("id", id);
        expect(div).to.have.attr("class", "test-zone");
        expect(span).to.have.text("test");

        const files = [1, 2];
        getFilesFromDragEvent.mockResolvedValueOnce(files);

        fireDrop();

        expect(getFilesFromDragEvent).toHaveBeenCalledWith(
            expect.objectContaining({ type: "drop" }),
            {}
        );

        await waitFor(() => {
            expect(UploadyContext.upload)
                .toHaveBeenCalledWith(files, {
                    autoUpload: true
                });
        });
    });

    it("should pass htmlDirContentParams", async () => {
        const htmlDirParams = { recursive: true };

        const { fireDrop } = testDropZone({
            htmlDirContentParams: htmlDirParams
        });

        getFilesFromDragEvent.mockResolvedValueOnce([1, 2]);

        fireDrop();

        expect(getFilesFromDragEvent).toHaveBeenCalledWith(
            expect.objectContaining({ type: "drop" }),
            htmlDirParams
        );
    });

    it("should use provided drop handler", async () => {
        const files = [1, 2];
        const dropHandler = vi.fn(() => files);

        const { fireDrop } = testDropZone({
            autoUpload: true,
            dropHandler,
        });

        fireDrop();

        await waitFor(() => {
            expect(getFilesFromDragEvent).not.toHaveBeenCalled();

            expect(dropHandler).toHaveBeenCalledWith(
                expect.objectContaining({ type: "drop" }),
                expect.any(Function)
            );

            expect(UploadyContext.upload)
                .toHaveBeenCalledWith(files, {
                    autoUpload: true
                });
        });
    });

    it("should getFiles in drop handler", async () => {
        const dropHandler = (e, getFiles) => {
            const files = getFiles();
            return files.slice(0, 1);
        };

        const files = [1, 2];
        getFilesFromDragEvent.mockReturnValueOnce(files);

        const { fireDrop } = testDropZone({
            autoUpload: true,
            dropHandler,
        });

        fireDrop();

        expect(getFilesFromDragEvent).toHaveBeenCalled();

        await waitFor(() => {
            expect(UploadyContext.upload)
                .toHaveBeenCalledWith([1], {
                    autoUpload: true
                });
        });
    });

    it("should add & remove drag className", () => {
        const onDragOverClassName = "drag-over";

        const { span, mockRef, fireDragEnter, fireDragEnd, fireDragOver, fireDragLeave } = testDropZone({
            onDragOverClassName
        }, false);

        const refElm = mockRef.mock.calls[0][0];

        fireDragEnter();
        fireDragOver();
        expect(refElm.classList.contains(onDragOverClassName)).toBe(true);
        fireDragEnd();
        expect(refElm.classList.contains(onDragOverClassName)).toBe(false);

        fireDragEnter();

        //simulate drag is over child element
        const fireDragEnterOnSpan = getDragEnterEvent(span);
        fireDragEnterOnSpan();
        fireDragLeave();

        expect(refElm.classList.contains(onDragOverClassName)).toBe(false);
        fireDragEnter();
        fireDragLeave();
        expect(refElm.classList.contains(onDragOverClassName)).toBe(false);
    });

    it("should not remove drag className if different element", () => {
        const onDragOverClassName = "drag-over";

        const { span, mockRef, fireDragEnter, fireDragEnd, fireDragOver } = testDropZone({
            onDragOverClassName,
        }, false);

        const refElm = mockRef.mock.calls[0][0];

        fireDragEnter();
        fireDragOver();
        expect(refElm.classList.contains("drag-over")).toBe(true);
        fireDragEnd();
        expect(refElm.classList.contains("drag-over")).toBe(false);

        fireDragEnter();

        //simulate drag is over child element
        const fireDragEnterOnSpan = getDragEnterEvent(span);
        fireDragEnterOnSpan();
        const fireDragLeaveOnSpan = getDragLeaveEvent(span);
        fireDragLeaveOnSpan();
        expect(refElm.classList.contains("drag-over")).toBe(true);
    });

    it("should not handle drag or add className if child and contains is disabled", () => {
        const onDragOverClassName = "drag-over";

        const { span, mockRef, fireDragEnter, fireDragEnd, fireDragOver } = testDropZone({
            enableOnContains: false,
            onDragOverClassName,
        }, false);

        const refElm = mockRef.mock.calls[0][0];

        fireDragEnter();
        fireDragOver();
        expect(refElm.classList.contains("drag-over")).toBe(true);
        fireDragEnd();
        expect(refElm.classList.contains("drag-over")).toBe(false);

        const fireDragEnterOnSpan = getDragEnterEvent(span);
        fireDragEnterOnSpan();
        const fireDragOverOnSpan = getDragOverEvent(span);
        fireDragOverOnSpan();
        expect(refElm.classList.contains("drag-over")).toBe(false);

        fireDragEnd();
        expect(refElm.classList.contains("drag-over")).toBe(false);
    });

    it("should add & remove drag className with shouldRemoveDragOver callback", () => {
        const onDragOverClassName = "drag-over";

        const { span, mockRef, fireDragEnter, fireDragEnd, fireDragOver } = testDropZone({
            onDragOverClassName,
            shouldRemoveDragOver: ({ target }) => target === span,
        }, false);

        const refElm = mockRef.mock.calls[0][0];

        fireDragEnter();
        fireDragOver();
        expect(refElm.classList.contains("drag-over")).toBe(true);
        fireDragEnd();
        expect(refElm.classList.contains("drag-over")).toBe(false);

        fireDragEnter();

        //simulate drag is over child element
        const fireDragEnterOnSpan = getDragEnterEvent(span);
        fireDragEnterOnSpan();
        const fireDragLeaveOnSpan = getDragLeaveEvent(span);
        fireDragLeaveOnSpan();
        expect(refElm.classList.contains("drag-over")).toBe(false);
    });

    it("should not add className if non provided", () => {
        const { mockRef, fireDragEnter, fireDragOver } = testDropZone();

        const refElm = mockRef.mock.calls[0][0];

        fireDragEnter();
        fireDragOver();
        expect(refElm.classList.contains("drag-over")).toBe(false);
    });

    describe("shouldHandleDrag tests", () => {
        it("should not handle drop when shouldHandleDrag is false", async () => {
            const { fireDrop } = testDropZone({
                shouldHandleDrag: false,
            });

            fireDrop();
            expect(getFilesFromDragEvent).not.toHaveBeenCalled();
            expect(UploadyContext.upload).not.toHaveBeenCalled();
        });

        it("should not handle drop when shouldHandleDrag is fn returning falsy", async () => {
            const { fireDrop } = testDropZone({
                shouldHandleDrag: () => null,
            });

            fireDrop();
            expect(getFilesFromDragEvent).not.toHaveBeenCalled();

            await waitFor(() => {
                expect(UploadyContext.upload).not.toHaveBeenCalled();
            });
        });

        it("should handle drop when shouldHandleDrag is fn returning truthy", async () => {
            const { fireDrop } = testDropZone({
                shouldHandleDrag: () => 1,
            });

            const files = [1, 2];
            getFilesFromDragEvent.mockResolvedValueOnce(files);

            fireDrop();

            expect(getFilesFromDragEvent).toHaveBeenCalled();

            await waitFor(() => {
                expect(UploadyContext.upload).toHaveBeenCalled();
            });
        });
    });
});
