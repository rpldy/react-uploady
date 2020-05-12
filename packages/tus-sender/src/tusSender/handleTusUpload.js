// @flow
import createUpload from "./createUpload";
import { TUS_SENDER_TYPE } from "./consts";

import type { SendOptions } from "@rpldy/sender";
import type { BatchItem } from "@rpldy/shared";
import type { OnProgress } from "@rpldy/chunked-sender";
import type { TusState } from "./types";

//create upload
//resume upload if exists

//TODO - need to handle relative link in resume/parallel



export default (items: BatchItem[],
                      url: string,
                      sendOptions: SendOptions,
                      onProgress: OnProgress,
                      tusState: TusState
) => {
    const request = new Promise((resolve) => {
        const { options } = tusState.getState();

        createUpload(items[0], url, tusState, sendOptions)
            .then(() => {
                if (options.parallel) {
                    //TODO: if has feature detection results - check if parallel ext supported by server
                } else {

                }
            });
    });

    return {
        //TODO: DUMMY RESPONSE !!!!

        request,
        abort: () => {},
        senderType: TUS_SENDER_TYPE,
    };
};

