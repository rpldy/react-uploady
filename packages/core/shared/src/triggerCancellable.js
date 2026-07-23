// @flow
import type { Trigger, TriggerCancellableOutcome } from "./types";

const triggerCancellable = (trigger: Trigger<unknown>, event?: string, ...args: unknown[]): TriggerCancellableOutcome => {
    const doTrigger = (event: string, ...args: unknown[]): Promise<boolean> =>
        new Promise((resolve, reject) => {
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

export default triggerCancellable;
