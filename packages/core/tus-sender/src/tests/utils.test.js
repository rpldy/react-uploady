import * as utils from "../utils";
import { DEFAULT_OPTIONS } from "../defaults";

describe("utils tests", () => {
	describe("getMandatoryOptions tests", () => {
		it("should return defaults for nothing", () => {
			expect(utils.getMandatoryOptions()).toEqual(DEFAULT_OPTIONS);
		});

		it("should return defaults for empty object", () => {
			expect(utils.getMandatoryOptions({})).toEqual(DEFAULT_OPTIONS);
		});

		it("should return defaults for undefined values", () => {
			expect(utils.getMandatoryOptions({
				overrideMethod: undefined,
				deferLength: undefined,
				sendDataOnCreate: undefined,
				storagePrefix: undefined,
				lockedRetryDelay: undefined,
			})).toEqual(DEFAULT_OPTIONS);
		});

		it("should return overrides where provided", () => {
			expect(utils.getMandatoryOptions({
				overrideMethod: true,
				deferLength: true,
				lockedRetryDelay: 1000,
			})).toEqual({
				...DEFAULT_OPTIONS,
				overrideMethod: true,
				deferLength: true,
				lockedRetryDelay: 1000,
			});
		});
	});
});