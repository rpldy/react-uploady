// @flow
import type { Batch } from "@rpldy/shared";
import type { AbortsMap } from "./types";

const fastAbortBatch = (batch: Batch, aborts: AbortsMap) => {
    batch.items.forEach(({ id }) => aborts[id]?.());
};

const fastAbortAll = (aborts: AbortsMap) => {
    //$FlowIssue[not-a-function]: flow doesnt understand Object.values :(
    const runFn = (fn) => fn?.();

    Object.values(aborts)
        .forEach(runFn);
};

export {
    fastAbortAll,
    fastAbortBatch,
};
