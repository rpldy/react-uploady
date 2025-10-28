// @flow
import { generateUploaderEventHook } from "@rpldy/shared-ui";
import { TUS_EVENTS } from "@rpldy/tus-sender";

import type { TusPartStartListenerHook } from "./types";

const useTusPartStartListener: TusPartStartListenerHook =
    generateUploaderEventHook(TUS_EVENTS.PART_START);

export default useTusPartStartListener;
