import React from "react";
import {
	UploadyContext
} from "@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock";
import withRequestPreSendUpdate from "../withRequestPreSendUpdate";
import { UPLOADER_EVENTS } from "@rpldy/uploader";

describe("withRequestPreSendUpdate tests", () => {

	it("should do nothing without id", () => {

		const MyComp = withRequestPreSendUpdate((props) => {
			return <div>{props.name}</div>;
		});

		const wrapper = mount(<MyComp name="bob"/>);

		expect(wrapper).toHaveText("bob");

		expect(UploadyContext.on).not.toHaveBeenCalled();
	});

	it("shouldn provide update data for matching item id",  async() => {
		let handlerPromise;

		const requestData = { items: [{ id: "bi0" }, { id: "bi1" }] };

		const MockComp = jest.fn((props) =>
			<div>{props.id}-{props.name}</div>);

		UploadyContext.on.mockImplementationOnce((name, handler) => {
			handlerPromise = handler(requestData);
			expect(handlerPromise).toBeInstanceOf(Promise);
		});

		const MyComp = withRequestPreSendUpdate(MockComp);

		const wrapper = mount(<MyComp id="bi1" name="bob"/>);

		expect(wrapper).toHaveText("bi1-bob");

		expect(MockComp).toHaveBeenCalledWith({
			id: "bi1",
			name: "bob",
			"requestData": null,
			"updateRequest": null,
		}, {});

		expect(MockComp).toHaveBeenCalledWith({
			id: "bi1",
			name: "bob",
			requestData,
			updateRequest: expect.any(Function),
		}, {});

		expect(UploadyContext.on)
			.toHaveBeenCalledWith(UPLOADER_EVENTS.REQUEST_PRE_SEND, expect.any(Function));

		MockComp.mock.calls[1][0].updateRequest("test");

		expect(UploadyContext.off)
			.toHaveBeenCalledWith(UPLOADER_EVENTS.REQUEST_PRE_SEND, expect.any(Function));

		const handlerResult = await handlerPromise;
		expect(handlerResult).toBe("test");
	});

	// it("shouldn't provide update data for different item id", () => {
	//
	//
	// });
	//
	// it("should unregister handler on id change", () => {
	//
	// });
});

