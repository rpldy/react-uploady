// @flow
import type { Batch } from "@rpldy/shared";
import type { AbortsMap } from "./types";

const fastAbortBatch = (batch: Batch, aborts: AbortsMap) => {
    batch.items.forEach(({ id }) => aborts[id]?.());
};

const fastAbortAll = (aborts: AbortsMap) => {
    //$FlowIssue[not-a-function]: flow doesnt understand Object.values :(
    const runFn = (fn: () => void) => fn();

    Object.values(aborts)
        //$FlowIssue[incompatible-call]
        .forEach(runFn);
};

export {
    fastAbortAll,
    fastAbortBatch,
};
