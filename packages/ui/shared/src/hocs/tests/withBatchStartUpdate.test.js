import React from "react";
import { UPLOADER_EVENTS } from "@rpldy/uploader";
import useUploadyContext from "../../hooks/useUploadyContext";
import withBatchStartUpdate from "../withBatchStartUpdate";
import mockContext from "../../tests/mocks/UploadyContext.mock";

jest.mock("../../hooks/useUploadyContext");

describe("withRequestPreSendUpdate tests", () => {

    beforeAll(() => {
        useUploadyContext.mockReturnValue(mockContext);
    });

    beforeEach(() => {
        clearJestMocks(
            mockContext,
        );
    });

    it("should do nothing without id", () => {
        const MyComp = withBatchStartUpdate((props) => {
            return <div>{props.name}</div>;
        });

        const wrapper = mount(<MyComp name="bob"/>);

        expect(wrapper).toHaveText("bob");

        expect(mockContext.on).not.toHaveBeenCalled();
    });

    it("shouldn't unregister if no id on first render", () => {
        const MyComp = withBatchStartUpdate((props) => {
            return <div>{props.name}</div>;
        });

        const wrapper = mount(<MyComp name="bob"/>);

        wrapper.setProps({ id: "bi1" });
        expect(mockContext.on).toHaveBeenCalledTimes(1);
        expect(mockContext.off).not.toHaveBeenCalled();
    });

    it("should provide update data for matching item id", async () => {
        let handlerPromise;

        const items = [{ id: "bi0" }, { id: "bi1" }];
        const options = { option: 1 };
        const batch = { id: "b1", items };

        const MockComp = jest.fn((props) =>
            <div>{props.name}-{props.requestData?.batch.id || ""}</div>);

        mockContext.on.mockImplementationOnce((name, handler) => {
            handlerPromise = handler(batch, options);
            expect(handlerPromise).toBeInstanceOf(Promise);
        });

        const MyComp = withBatchStartUpdate(MockComp);

        const wrapper = mount(<MyComp id={"b1"} name="bob"/>);

        expect(wrapper).toHaveText("bob-b1");

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

        expect(mockContext.on)
            .toHaveBeenCalledWith(UPLOADER_EVENTS.BATCH_START, expect.any(Function));

        MockComp.mock.calls[1][0].updateRequest("test");

        expect(mockContext.off)
            .toHaveBeenCalledWith(UPLOADER_EVENTS.BATCH_START, expect.any(Function));

        const handlerResult = await handlerPromise;
        expect(handlerResult).toBe("test");
    });

    it("shouldn't provide update data for different item id", () => {
        const items = [{ id: "bi0" }, { id: "bi1" }];
        const options = { option: 1 };
        const batch = { id: "b1", items };

        const MockComp = jest.fn((props) =>
            <div>{props.id}-{props.name}-{props.requestData?.batch.id || ""}</div>);

        mockContext.on.mockImplementationOnce((name, handler) => {
            const handlerPromise = handler(batch, options);
            expect(handlerPromise).toBeUndefined();
        });

        const MyComp = withBatchStartUpdate(MockComp);

        const wrapper = mount(<MyComp id={"b2"} name="bob"/>);

        expect(wrapper).toHaveText("b2-bob-");

        expect(mockContext.on)
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

        const MockComp = jest.fn((props) =>
            <div>{props.name}-{props.requestData?.batch.id || ""}</div>);

        mockContext.on.mockImplementationOnce((name, handler) => {
            const handlerPromise = handler(batch, options);
            expect(handlerPromise).toBeInstanceOf(Promise);
        });

        const MyComp = withBatchStartUpdate(MockComp);

        const wrapper = mount(<MyComp id={"b1"} name="bob"/>);

        expect(mockContext.on)
            .toHaveBeenCalledWith(UPLOADER_EVENTS.BATCH_START, expect.any(Function));

        wrapper.setProps({ id: "b2" });

        expect(mockContext.off)
            .toHaveBeenCalledWith(UPLOADER_EVENTS.BATCH_START, expect.any(Function));

        expect(mockContext.on).toHaveBeenCalledTimes(2);

    });
});
