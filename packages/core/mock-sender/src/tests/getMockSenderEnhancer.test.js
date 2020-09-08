import createMockSender from "../mockSender";
import getMockSenderEnhancer from "../getMockSenderEnhancer";

jest.mock("../mockSender");

describe("getMockSenderEnhancer tests", () => {
	it("should create enhancer", () => {
		createMockSender.mockReturnValueOnce({send: "mock"});

		const uploader = { update: jest.fn() };
		const enhancer = getMockSenderEnhancer({ test: true });

		expect(enhancer(uploader)).toBe(uploader);
		expect(uploader.update).toHaveBeenCalledWith({send: "mock"});
	});
});