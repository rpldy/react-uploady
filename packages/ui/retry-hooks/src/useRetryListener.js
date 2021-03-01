// @flow
import { generateUploaderEventHook } from "@rpldy/shared-ui";
import { RETRY_EVENT } from "@rpldy/retry";

import type { RetryListenerHook } from "./types";

const useRetryListener = (generateUploaderEventHook(RETRY_EVENT, false): RetryListenerHook);

export default useRetryListener;
