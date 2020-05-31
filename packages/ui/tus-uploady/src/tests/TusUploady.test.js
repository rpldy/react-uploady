import React from "react";

describe("TusUploady tests", () => {

	let Uploady, composeEnhancers, TusUploady, logWarning;
	const tusEnhancer = (uploader) => uploader;

	const mockGetTusdEnhancer = jest.fn(() => tusEnhancer);

	afterEach(() => {
		clearJestMocks(
			mockGetTusdEnhancer,
			logWarning,
		);
	});

	const doTest = (testFn, mockChunkSupport = true) => {
		jest.isolateModules(() => {
			jest.mock("@rpldy/tus-sender", () => ({
				getTusEnhancer: mockGetTusdEnhancer,
				CHUNKING_SUPPORT : mockChunkSupport,
			}));

			logWarning = require("@rpldy/shared-ui/src/tests/mocks/rpldy-ui-shared.mock").logWarning;

			Uploady = require("@rpldy/uploady/src/tests/mocks/rpldy-uploady.mock").default;
			composeEnhancers = Uploady.composeEnhancers;

			TusUploady = require("../TusUploady").default;

			testFn();
		});
	};

	it("should render ChunkedUploady with enhancer", () => {
		doTest(() => {
			const tusProps = {
				chunked: true,
				chunkSize: 11,
				retries: 7,
				parallel: 3,
				deferLength: true,
				featureDetection: true,
				storagePrefix: "---"
			};

			const enhancer = jest.fn((uploader) => uploader);

			const props = {
				enhancer,
				...tusProps,
			};

			composeEnhancers.mockReturnValueOnce(enhancer);

			const wrapper = shallow(<TusUploady {...props} />);

			const UploadyElm = wrapper.find(Uploady);

			expect(UploadyElm).toHaveLength(1);

			const update = jest.fn();
			const uploader = enhancer({
				update,
			});

			expect(uploader).toBeDefined();
			expect(composeEnhancers).toHaveBeenCalledWith(tusEnhancer, enhancer);

			expect(logWarning).toHaveBeenCalledWith(true, expect.any(String));
			expect(mockGetTusdEnhancer).toHaveBeenCalledWith(tusProps);
		});
	});

	it("should render ChunkedUploady without enhancer", () => {
		doTest(() => {
			const wrapper = shallow(<TusUploady/>);

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

	it("should render Uploady when no chunk support", () => {
		doTest(() => {
			shallow(<TusUploady/>);

			expect(logWarning).toHaveBeenCalledWith(false, expect.any(String));
			expect(mockGetTusdEnhancer).not.toHaveBeenCalled();

		}, false);
	});
});
