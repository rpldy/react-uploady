// @flow
import type { Trigger, Cancellable } from "./types";

type Outcome = Promise<boolean> | Cancellable;

export default (trigger: Trigger<mixed>, event?: string, ...args?: mixed[]): Outcome => {
	const doTrigger = async (event: string, ...args?: mixed[]): Promise<boolean> => {
		let cancelled = false;
		const results: Promise<any>[] = trigger(event, ...args);

		if (results && results.length) {
			const resolved = await Promise.all(results);
			cancelled = !!~resolved.findIndex((r: any) => r === false);
		}

		return cancelled;
	};

	return event ? doTrigger(event, ...args) : doTrigger;
};
