import React from "react";

describe("ChunkedUploady tests", () => {

	let Uploady, ChunkedUploady, logWarning;
	const chunkedSend = () => {
	};

	const mockGetChunkedSend = jest.fn(() => chunkedSend);

	afterEach(() => {
		clearJestMocks(
			mockGetChunkedSend,
            logWarning,
		);
	});

	const doTest = (testFn, mockChunkSupport = true) => {
		jest.isolateModules(() => {

			jest.mock("../chunkedSender", () => mockGetChunkedSend);
			jest.mock("../utils", () => ({
				CHUNKING_SUPPORT: mockChunkSupport
			}));

            logWarning = require("@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock").logWarning;

			Uploady = require("@rpldy/uploady/src/tests/mocks/rpldy-uploady.mock").default;

			ChunkedUploady = require("../ChunkedUploady").default;

			testFn();
		});
	};

	it("should render ChunkedUploady with enhancer", () => {
		doTest(() => {
			const chunkedProps = {
				chunked: true,
				chunkSize: 11,
				retries: 7,
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

			expect(logWarning).toHaveBeenCalledWith(true, expect.any(String));
			expect(mockGetChunkedSend).toHaveBeenCalledWith(chunkedProps);
		});
	});

	it("should render ChunkedUploady without enhancer", () => {
		doTest(() => {
			const wrapper = shallow(<ChunkedUploady/>);

			const UploadyElm = wrapper.find(Uploady);

			const enhancer = UploadyElm.props().enhancer;

			const update = jest.fn();
			const uploader = {
				update,
			};

			const enhancedUploader = enhancer(uploader);
			expect(enhancedUploader).toBe(uploader);
		});
	});

	it("should only pass defined chunked props", () => {
		doTest(() => {
			const wrapper = shallow(<ChunkedUploady chunkSize={5000}
			destination="test"/>);
			expect(mockGetChunkedSend).toHaveBeenCalledWith({
				chunkSize: 5000
			});

			expect(wrapper.find(Uploady)).toHaveProp("destination", "test");
		});
	});

	it("should render Uploady when no chunk support", () => {
		doTest(() => {
			shallow(<ChunkedUploady/>);

			expect(logWarning).toHaveBeenCalledWith(false, expect.any(String));
			expect(mockGetChunkedSend).not.toHaveBeenCalled();

		}, false);
	});
});
