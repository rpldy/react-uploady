// @flow
import { devFreeze } from "@rpldy/shared";
import type { Options } from "./types";

const defaults: Options = devFreeze({
	allowRegisterNonExistent: true,
	canAddEvents: true,
	canRemoveEvents: true,
	collectStats: false,
});

export default defaults;


