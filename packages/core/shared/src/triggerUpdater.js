// @flow
import { isEmpty } from "./utils";
import type { Trigger, Updater } from "./types";

type Outcome<T> = Promise<?T> | Updater<?T>;

const triggerUpdater = <T>(trigger: Trigger<T>, event?: string, ...args?: mixed[]): Outcome<T> => {
    const doTrigger = (event: string, ...args?: mixed[]): Promise<?T> => new Promise((resolve, reject) => {
        const results: Promise<?T>[] = trigger(event, ...args);

        if (results && results.length) {
            Promise.all(results)
                .catch(reject)
                .then((resolvedResults) => {
                    let result;
                    if (resolvedResults) {
                        while (isEmpty(result) && resolvedResults.length) {
                            result = resolvedResults.pop();
                        }
                    }

                    resolve(isEmpty(result) ? undefined : result);
                });
        } else {
            resolve();
        }
    });

    return event ? doTrigger(event, ...args) : doTrigger;
};

export default triggerUpdater;
