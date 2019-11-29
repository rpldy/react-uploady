const mockSender = jest.fn();

jest.mock("../sender", () => mockSender);

import createProcessor, {initUploadQueue} from "../processor";

describe("processor tests", () => {

	describe("upload queue tests", () => {

		const getQueue = (state = null) =>  {

			state = {
				currentBatch: null,
				batches: {},
				items: {},
				activeIds: [],
				...state
			};
			
			const queue = initUploadQueue()

		};

		it("should send file to upload successfully", () => {
			
		});

		it("should put file into pending queue in case no concurrent", () => {
			
		});

		it("should send file to upload if concurrent enabled ", () => {
			
		});

		it("should group files into single upload", () => {

		});


	});


});