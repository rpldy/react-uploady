// @flow
import { getUpdateable } from "@rpldy/shared";
import { CHUNKING_SUPPORT  } from "@rpldy/chunked-sender";
import handleEvents from "./handleEvents";

import type { BatchItem } from "@rpldy/shared";
import type {
    ChunkedSender,
    OnProgress,
    SendOptions,
    SendResult,
} from "@rpldy/chunked-sender";
import type { UploaderType } from "@rpldy/uploader";
import type { TusOptions } from "../types";
import type { TusState } from "./types";

export default (uploader: UploaderType, chunkedSender: ChunkedSender, options: TusOptions) => {

    const { state, update } = getUpdateable({
        options,
        // items: [],
    });

    const tusState: TusState = {
        getState: () => state,
        updateState: update,
    };

    handleEvents(tusState, chunkedSender);

    const tusSend =  (
        items: BatchItem[],
        url: string,
        sendOptions: SendOptions,
        onProgress: OnProgress
    ): SendResult => {

        //TUS only supports a single file upload (no grouping)
        if (items.length === 1) {



            if (options.parallel) {
                //TODO: if has feature detection results - check if parallel ext supported by server
            } else {

            }
        }

        return chunkedSender.send(items, url, sendOptions, onProgress);

        //create upload
        //resume upload if exists
    };

    return CHUNKING_SUPPORT ?
        //chunking is supported, we can use TUS
        tusSend :
        //chunking isn't supported, let the chunked-sender delegate to the xhr sender
        chunkedSender.send;
};



//register to chunked sender: on chunk start, on chunk finish
//register to uploader item abort ? or just use the request response promise?


/**

 perform options request - beginning of session
 * make this configurable
 - store per server : extensions, version,


 Upload

 - creation || creation-with-upload
 - checksum ???


 Expiration ???

 **/
