import React from "react";
import { UPLOADER_EVENTS } from "@rpldy/uploader";
import useUploadyContext from "../../hooks/useUploadyContext";
import withBatchStartUpdate from "../withBatchStartUpdate";
import { UploadyContextMock } from "../../tests/mocks/UploadyContext.mock";

vi.mock("../../hooks/useUploadyContext");

describe("withRequestPreSendUpdate tests", () => {
    beforeAll(() => {
        useUploadyContext.mockReturnValue(UploadyContextMock);
    });

    beforeEach(() => {
        clearViMocks(
            UploadyContextMock,
        );
    });

    it("should do nothing without id", () => {
        const MyComp = withBatchStartUpdate((props) => {
            return <div>{props.name}</div>;
        });

        const { container } = render(<MyComp name="bob"/>);

        expect(container.firstChild).to.have.text("bob");

        expect(UploadyContextMock.on).not.toHaveBeenCalled();
    });

    it("shouldn't unregister if no id on first render", () => {
        const MyComp = withBatchStartUpdate((props) => {
            return <div>{props.name}</div>;
        });

        const { rerender } = render(<MyComp name="bob"/>);

        rerender(<MyComp name="bob" id="bi1"/> );
        expect(UploadyContextMock.on).toHaveBeenCalledTimes(1);
        expect(UploadyContextMock.off).not.toHaveBeenCalled();
    });

    it("should provide update data for matching item id", async () => {
        let handlerPromise;

        const items = [{ id: "bi0" }, { id: "bi1" }];
        const options = { option: 1 };
        const batch = { id: "b1", items };

        const MockComp = vi.fn((props) =>
            <div>{props.name}-{props.requestData?.batch.id || ""}</div>);

        UploadyContextMock.on.mockImplementationOnce((name, handler) => {
            handlerPromise = handler(batch, options);
            expect(handlerPromise).toBeInstanceOf(Promise);
        });

        const MyComp = withBatchStartUpdate(MockComp);

        const { container } = render(<MyComp id={"b1"} name="bob"/>);

        expect(container.firstChild).to.have.text("bob-b1");

        expect(MockComp).toHaveBeenCalledWith({
            id: "b1",
            name: "bob",
            requestData: null,
            updateRequest: null,
        }, {});

        expect(MockComp).toHaveBeenCalledWith({
            id: "b1",
            name: "bob",
            requestData: { items, options, batch },
            updateRequest: expect.any(Function),
        }, {});

        expect(UploadyContextMock.on)
            .toHaveBeenCalledWith(UPLOADER_EVENTS.BATCH_START, expect.any(Function));

        MockComp.mock.calls[1][0].updateRequest("test");

        expect(UploadyContextMock.off)
            .toHaveBeenCalledWith(UPLOADER_EVENTS.BATCH_START, expect.any(Function));

        const handlerResult = await handlerPromise;
        expect(handlerResult).toBe("test");
    });

    it("shouldn't provide update data for different item id", () => {
        const items = [{ id: "bi0" }, { id: "bi1" }];
        const options = { option: 1 };
        const batch = { id: "b1", items };

        const MockComp = vi.fn((props) =>
            <div>{props.id}-{props.name}-{props.requestData?.batch.id || ""}</div>);

        UploadyContextMock.on.mockImplementationOnce((name, handler) => {
            const handlerPromise = handler(batch, options);
            expect(handlerPromise).toBeUndefined();
        });

        const MyComp = withBatchStartUpdate(MockComp);

        const { container } = render(<MyComp id={"b2"} name="bob"/>);

        expect(container.firstChild).to.have.text("b2-bob-");

        expect(UploadyContextMock.on)
            .toHaveBeenCalledWith(UPLOADER_EVENTS.BATCH_START, expect.any(Function));

        expect(MockComp).toHaveBeenCalledTimes(1);

        expect(MockComp).toHaveBeenCalledWith({
            id: "b2",
            name: "bob",
            requestData: null,
            updateRequest: null,
        }, {});
    });

    it("should unregister handler on id change", async () => {
        const items = [{ id: "bi0" }, { id: "bi1" }];
        const options = { option: 1 };
        const batch = { id: "b1", items };

        const MockComp = vi.fn((props) =>
            <div>{props.name}-{props.requestData?.batch.id || ""}</div>);

        UploadyContextMock.on.mockImplementationOnce((name, handler) => {
            const handlerPromise = handler(batch, options);
            expect(handlerPromise).toBeInstanceOf(Promise);
        });

        const MyComp = withBatchStartUpdate(MockComp);

        const { rerender } = render(<MyComp id="b1" name="bob"/>);

        expect(UploadyContextMock.on)
            .toHaveBeenCalledWith(UPLOADER_EVENTS.BATCH_START, expect.any(Function));

        rerender(<MyComp id="b2" name="bob"/>);

        expect(UploadyContextMock.off)
            .toHaveBeenCalledWith(UPLOADER_EVENTS.BATCH_START, expect.any(Function));

        expect(UploadyContextMock.on).toHaveBeenCalledTimes(2);
    });
});
