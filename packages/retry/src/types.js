// @flow

import { BatchItem } from "@rpldy/shared";

export type State = {
    batchIdsMap: {
        [string]: string
    },
    failed: {
        [string]: BatchItem
    },
};

export type RetryState = {
    updateState: (State) => void,
    getState: () => State,

};
