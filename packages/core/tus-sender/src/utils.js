// @flow

import { merge } from "@rpldy/shared";
import { DEFAULT_OPTIONS } from "./defaults";
import type { TusOptions } from "./types";

const getMandatoryOptions = (options: ?TusOptions): TusOptions =>
    merge({}, DEFAULT_OPTIONS, options);

export {
    getMandatoryOptions,
};
