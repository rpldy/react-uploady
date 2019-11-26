// @flow
import { DEFAULT_OPTIONS } from "./defaults";
import type { CreateOptions } from "@rupy/shared";
import type { MandatoryCreateOptions } from "../types";

const getMandatoryOptions = (options: ?CreateOptions): MandatoryCreateOptions => {
	//TODO: improve this hack for flow
	const defaultsCopy = { ...DEFAULT_OPTIONS }; //doing this for flow... :(
	return Object.assign(defaultsCopy, options);
};

export {
	getMandatoryOptions,
}