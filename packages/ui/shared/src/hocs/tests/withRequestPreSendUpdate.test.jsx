import React from "react";
import { UPLOADER_EVENTS } from "@rpldy/uploader";
import useUploadyContext from "../../hooks/useUploadyContext";
import withRequestPreSendUpdate from "../withRequestPreSendUpdate";
import mockContext from "../../tests/mocks/UploadyContext.mock";

vi.mock("../../hooks/useUploadyContext");

describe("withBatchStartUpdate tests", () => {
    beforeAll(()=>{
        useUploadyContext.mockReturnValue(mockContext);
    });

	beforeEach(() => {
		clearViMocks(
            mockContext,
		);
	});

	it("should do nothing without id", () => {
		const MyComp = withRequestPreSendUpdate((props) => {
            return <div>{props.name}</div>;
        });

        const { container } = render(<MyComp name="bob"/>);

        expect(container.firstChild).to.have.text("bob");
        expect(mockContext.on).not.toHaveBeenCalled();
	});

	it("shouldn't unregister if no id on first render", () => {
        const MyComp = withRequestPreSendUpdate((props) => {
            return <div>{props.name}</div>;
        });

        const { rerender } = render(<MyComp name="bob"/>);

        rerender(<MyComp name="bob" id="bi1" />);
        expect(mockContext.on).toHaveBeenCalledTimes(1);
        expect(mockContext.off).not.toHaveBeenCalled();
    });

	it("should provide update data for matching item id", async () => {
        let handlerPromise;

        const requestData = { items: [{ id: "bi0" }, { id: "bi1" }] };

        const MockComp = vi.fn((props) =>
            <div>{props.id}-{props.name}</div>);

        mockContext.on.mockImplementationOnce((name, handler) => {
            handlerPromise = handler(requestData);
            expect(handlerPromise).toBeInstanceOf(Promise);
        });

		const MyComp = withRequestPreSendUpdate(MockComp);

		const { container } = render(<MyComp id="bi1" name="bob"/>);

		expect(container.firstChild).to.have.text("bi1-bob");

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

		const MockComp = vi.fn((props) =>
			<div>{props.id}-{props.name}</div>);

        mockContext.on.mockImplementationOnce((name, handler) => {
			handlerPromise = handler(requestData);
			expect(handlerPromise).toBeUndefined();
		});

		const MyComp = withRequestPreSendUpdate(MockComp);

		const { container } = render(<MyComp id="bi1" name="bob"/>);

        expect(container.firstChild).to.have.text("bi1-bob");

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
		const MockComp = vi.fn((props) =>
			<div>{props.id}-{props.name}</div>);

		const MyComp = withRequestPreSendUpdate(MockComp);

		const { container, rerender } = render(<MyComp id="bi1" name="bob"/>);

        expect(container.firstChild).to.have.text("bi1-bob");

		expect(mockContext.on)
			.toHaveBeenCalledWith(UPLOADER_EVENTS.REQUEST_PRE_SEND, expect.any(Function));

        mockContext.on.mockImplementationOnce((name, handler) => {
			const handlerPromise = handler({ items: [{ id: "bi2" }] });
			expect(handlerPromise).toBeInstanceOf(Promise);
		});

        rerender(<MyComp id="bi2" name="bob"/>);

		expect(mockContext.off)
			.toHaveBeenCalledWith(UPLOADER_EVENTS.REQUEST_PRE_SEND, expect.any(Function));

		expect(mockContext.on).toHaveBeenCalledTimes(2);
	});
});
