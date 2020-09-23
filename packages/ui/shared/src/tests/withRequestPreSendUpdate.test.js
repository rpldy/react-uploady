import React from "react";
import { UPLOADER_EVENTS } from "@rpldy/uploader";
import useUploadyContext from "../useUploadyContext";
import withRequestPreSendUpdate from "../withRequestPreSendUpdate";
import mockContext from "./mocks/UploadyContext.mock";

jest.mock("../useUploadyContext");

describe("withRequestPreSendUpdate tests", () => {

    beforeAll(()=>{
        useUploadyContext.mockReturnValue(mockContext);
    });

	beforeEach(() => {
		clearJestMocks(
            mockContext,
		);
	});

	it("should do nothing without id", () => {

		const MyComp = withRequestPreSendUpdate((props) => {
			return <div>{props.name}</div>;
		});

		const wrapper = mount(<MyComp name="bob"/>);

		expect(wrapper).toHaveText("bob");

		expect(mockContext.on).not.toHaveBeenCalled();
	});

	it("shouldn't unregister if no id on first render", () => {

		const MyComp = withRequestPreSendUpdate((props) => {
			return <div>{props.name}</div>;
		});

		const wrapper = mount(<MyComp name="bob"/>);

		wrapper.setProps({id: "bi1"});
		expect(mockContext.on).toHaveBeenCalledTimes(1);
		expect(mockContext.off).not.toHaveBeenCalled();
	});

	it("shouldn't provide update data for matching item id", async () => {
		let handlerPromise;

		const requestData = { items: [{ id: "bi0" }, { id: "bi1" }] };

		const MockComp = jest.fn((props) =>
			<div>{props.id}-{props.name}</div>);

        mockContext.on.mockImplementationOnce((name, handler) => {
			handlerPromise = handler(requestData);
			expect(handlerPromise).toBeInstanceOf(Promise);
		});

		const MyComp = withRequestPreSendUpdate(MockComp);

		const wrapper = mount(<MyComp id="bi1" name="bob"/>);

		expect(wrapper).toHaveText("bi1-bob");

		expect(MockComp).toHaveBeenCalledWith({
			id: "bi1",
			name: "bob",
			requestData: null,
			updateRequest: null,
		}, {});

		expect(MockComp).toHaveBeenCalledWith({
			id: "bi1",
			name: "bob",
			requestData,
			updateRequest: expect.any(Function),
		}, {});

		expect(mockContext.on)
			.toHaveBeenCalledWith(UPLOADER_EVENTS.REQUEST_PRE_SEND, expect.any(Function));

		MockComp.mock.calls[1][0].updateRequest("test");

		expect(mockContext.off)
			.toHaveBeenCalledWith(UPLOADER_EVENTS.REQUEST_PRE_SEND, expect.any(Function));

		const handlerResult = await handlerPromise;
		expect(handlerResult).toBe("test");
	});

	it("shouldn't provide update data for different item id", () => {
		let handlerPromise;

		const requestData = { items: [{ id: "bi2" }, { id: "bi3" }] };

		const MockComp = jest.fn((props) =>
			<div>{props.id}-{props.name}</div>);

        mockContext.on.mockImplementationOnce((name, handler) => {
			handlerPromise = handler(requestData);
			expect(handlerPromise).toBeUndefined();
		});

		const MyComp = withRequestPreSendUpdate(MockComp);

		const wrapper = mount(<MyComp id="bi1" name="bob"/>);

		expect(wrapper).toHaveText("bi1-bob");

		expect(mockContext.on)
			.toHaveBeenCalledWith(UPLOADER_EVENTS.REQUEST_PRE_SEND, expect.any(Function));

		expect(MockComp).toHaveBeenCalledTimes(1);

		expect(MockComp).toHaveBeenCalledWith({
			id: "bi1",
			name: "bob",
			requestData: null,
			updateRequest: null,
		}, {});
	});

	it("should unregister handler on id change", () => {

		const MockComp = jest.fn((props) =>
			<div>{props.id}-{props.name}</div>);

		const MyComp = withRequestPreSendUpdate(MockComp);

		const wrapper = mount(<MyComp id="bi1" name="bob"/>);

		expect(wrapper).toHaveText("bi1-bob");

		expect(mockContext.on)
			.toHaveBeenCalledWith(UPLOADER_EVENTS.REQUEST_PRE_SEND, expect.any(Function));

        mockContext.on.mockImplementationOnce((name, handler) => {
			const handlerPromise = handler({ items: [{ id: "bi2" }] });
			expect(handlerPromise).toBeInstanceOf(Promise);
		});

		wrapper.setProps({ id: "bi2" });

		expect(mockContext.off)
			.toHaveBeenCalledWith(UPLOADER_EVENTS.REQUEST_PRE_SEND, expect.any(Function));

		expect(mockContext.on).toHaveBeenCalledTimes(2);
	});
});
