// @flow
import type { Trigger, Cancellable } from "./types";

type Outcome = Promise<boolean> | Cancellable;

export default (trigger: Trigger<mixed>, event?: string, ...args?: mixed[]): Outcome => {
	const doTrigger = (event: string, ...args?: mixed[]): Promise<boolean> => new Promise((resolve, reject) => {
        const results: Promise<any>[] = trigger(event, ...args);

        if (results && results.length) {
            Promise.all(results)
                .catch(reject)
                .then((resolvedResults) =>
                    resolvedResults && resolve(!!~resolvedResults
                        .findIndex((r: any) => r === false)));
        } else {
            resolve(false);
        }
    });

    return event ? doTrigger(event, ...args) : doTrigger;
};
