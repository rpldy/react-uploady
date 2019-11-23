// @flow

export default async (trigger: Function, event?: string, ...args?: any[]) => {
	const doTrigger = async (event, ...args) => {
		let cancelled = false;

		const results = trigger(event, ...args);

		if (results && results.length) {
			const resolved = await Promise.all(results);

			cancelled = !!resolved.find((r: any) => r === false);
		}

		return cancelled;
	};

	return event ? doTrigger(event, ...args) : doTrigger;
};