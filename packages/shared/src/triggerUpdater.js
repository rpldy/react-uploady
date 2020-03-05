// @flow
import type { Trigger, Updater } from "./types";

type Outcome<T> = Promise<?T> | Updater<?T>;

const isEmpty = (val) =>
	(val === null || val === undefined);

export default <T>(trigger: Trigger<T>, event?: string, ...args?: mixed[]): Outcome<T> => {
	const doTrigger = async (event: string, ...args?: mixed[]): Promise<?T> => {
		let result;
		const results: Promise<?T>[] = trigger(event, ...args);

		if (results && results.length) {
			const resolved = await Promise.all(results);

			while (isEmpty(result) && resolved.length) {
				result = resolved.pop();
			}
		}

		return isEmpty(result) ? undefined : result;
	};

	return event ? doTrigger(event, ...args) : doTrigger;
};
