// @flow
import { generateUploaderEventHook } from "@rpldy/shared-ui";
import { RETRY_EVENT } from "@rpldy/retry";

export default (generateUploaderEventHook(RETRY_EVENT, false): any);
