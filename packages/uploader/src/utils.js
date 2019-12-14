// @flow
import { DEFAULT_OPTIONS, DEFAULT_PARAM_NAME } from "./defaults";

import type { CreateOptions, Destination } from "@rupy/shared";

const getMandatoryDestination = (dest: Destination): Destination => {
	return {
		filesParamName: DEFAULT_PARAM_NAME,
		params: {},
		...dest,
	};
};

const getMandatoryOptions = (options: CreateOptions): CreateOptions => {
	return {
		...DEFAULT_OPTIONS,
		...options,
		destination: getMandatoryDestination(options.destination || {})
	};
};

export {
	getMandatoryOptions,
};