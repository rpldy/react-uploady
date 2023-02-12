// @flow
import { logger, hasWindow } from "@rpldy/shared";
import createState from "@rpldy/simple-state";
import { createChunkedSender } from "@rpldy/chunked-sender";
import { getMandatoryOptions } from "../utils";
import handleEvents from "./handleEvents";
import getTusSend from "./tusSend";

import type { UploaderType, UploaderCreateOptions } from "@rpldy/uploader";
import type { TusOptions, State, TusState } from "../types";
import type { TriggerMethod } from "@rpldy/life-events";

const initializeState = (uploader: UploaderType<UploaderCreateOptions>, options: ?TusOptions): TusState => {
    const { state, update } = createState<State>({
        options,
        items: {},
        featureDetection: {
            extensions: null,
            version: null,
            processed: false,
        }
    });

    const tusState = {
        getState: (): State => state,
        updateState: update,
    };

    if (hasWindow() && logger.isDebugOn()) {
        window[`__rpldy_${uploader.id}_tus_state`] = tusState;
    }

    return tusState;
};

const getResolvedOptions = (options: ?TusOptions): TusOptions => {
    const resolvedOptions = getMandatoryOptions(options);

    if ((resolvedOptions.sendDataOnCreate || resolvedOptions.parallel) && resolvedOptions.deferLength) {
        logger.debugLog(`tusSender: turning off deferLength - cannot be used when sendDataOnCreate or parallel is enabled`);
        resolvedOptions.deferLength = false;
    }

    //force chunked for TUS
    resolvedOptions.chunked = true;

    return resolvedOptions;
};

const createTusSender = (
    uploader: UploaderType<UploaderCreateOptions>,
    options: ?TusOptions,
    trigger: TriggerMethod
): {|getOptions: () => TusOptions, send: any|} => {
    const resolvedOptions = getResolvedOptions(options);
    const chunkedSender = createChunkedSender(resolvedOptions, trigger);
    const tusState = initializeState(uploader, resolvedOptions);

    handleEvents(uploader, tusState, chunkedSender, trigger);

    const send = getTusSend(chunkedSender, tusState, trigger);

    return {
        send,
        getOptions: () => tusState.getState().options,
    };
};

export default createTusSender;
