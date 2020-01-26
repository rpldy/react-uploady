import React from "react";
import Uploady from "@rpldy/uploady/src/tests/mocks/rpldy-uploady.mock";

jest.mock("../chunkedSender", () => jest.fn());
import mockGetChunkedSend from "../chunkedSender";
import ChunkedUploady from "../ChunkedUploady";

describe("ChunkedUploady tests", () => {

	const chunkedSend = () => {};//jest.fn();

	beforeAll(() => {
		mockGetChunkedSend.mockImplementation(() => chunkedSend);
	});

	beforeEach(() => {
		clearJestMocks(
			mockGetChunkedSend,
		);
	});

	it("should render ChunkedUploady with enhancer", () => {

		const chunkedProps = {
			chunked: true,
			chunkSize: 11,
			retry: 7,
			parallel: 3,
		};

		const props = {
			enhancer: jest.fn((uploader) => uploader),
			...chunkedProps,
		};

		const wrapper = shallow(<ChunkedUploady {...props} />);

		const UploadyElm = wrapper.find(Uploady);

		expect(UploadyElm).toHaveLength(1);

		const enhancer = UploadyElm.props().enhancer;

		const update = jest.fn();
		const uploader = enhancer({
			update,
		});

		expect(uploader).toBeDefined();
		expect(update.mock.calls[0][0].send).toBe(chunkedSend);
		expect(props.enhancer).toHaveBeenCalled();

		expect(mockGetChunkedSend).toHaveBeenCalledWith(chunkedProps);
	});

	it("should render ChunkedUploady without enhancer", () => {
		throw new Error();
	});

});
