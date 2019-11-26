// @flow

export default (trigger: Function, event?: string, ...args?: any[]) : Function | Promise<boolean> => {
	const doTrigger = async (event: string, ...args?: any[]): Promise<boolean> => {
		let cancelled = false;
		const results = trigger(event, ...args);

		if (results && results.length) {
			const resolved = await Promise.all(results);
			cancelled = !!~resolved.findIndex((r: any) => r === false);
		}

		return cancelled;
	};

	return event ? doTrigger(event, ...args) : doTrigger;
};