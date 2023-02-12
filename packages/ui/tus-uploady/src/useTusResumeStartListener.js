// @flow
import { generateUploaderEventHook } from "@rpldy/shared-ui";
import { TUS_EVENTS } from "@rpldy/tus-sender";

import type { TusResumeStartListenerHook } from "./types";

const useTusResumeStartListener: TusResumeStartListenerHook =
    generateUploaderEventHook(TUS_EVENTS.RESUME_START);

export default useTusResumeStartListener;
