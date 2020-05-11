// @flow
import createUpload from "./createUpload";

import type { SendOptions } from "@rpldy/sender";
import type { BatchItem } from "@rpldy/shared";
import type { OnProgress } from "@rpldy/chunked-sender";
import type { TusState } from "./types";

//create upload
//resume upload if exists

//TODO - need to handle relative link in resume/parallel



export default async (items: BatchItem[],
                      url: string,
                      sendOptions: SendOptions,
                      onProgress: OnProgress,
                      tusState: TusState
) => {
    const { options } = tusState.getState();

    await createUpload(items[0], url, tusState, sendOptions);

    if (options.parallel) {
        //TODO: if has feature detection results - check if parallel ext supported by server
    } else {

    }
};

