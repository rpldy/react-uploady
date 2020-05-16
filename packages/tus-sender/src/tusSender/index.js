// @flow
import { createChunkedSender } from "@rpldy/chunked-sender";
import { getMandatoryOptions } from "../utils";
import getTusSend from "./tusSend";

import type { UploaderType } from "@rpldy/uploader";
import type { TusOptions } from "../types";

export default (uploader: UploaderType, options: ?TusOptions) => {
    options = getMandatoryOptions(options);
    const chunkedSender = createChunkedSender(options);

    const send = getTusSend(uploader, chunkedSender, options);

    return {
        send,
    };
};
