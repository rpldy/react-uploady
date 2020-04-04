// @flow

import type { BatchItem } from "@rpldy/shared";

export type State = {
    batchIdsMap: {
        [string]: string[]
    },
    failed: {
        [string]: BatchItem
    },
};

export type RetryState = {
    updateState: ((State) => void) => void,
    getState: () => State,

};
