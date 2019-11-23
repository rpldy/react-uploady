// @flow

export type Options = {
	//whether clients can register to unspecified events in advance (default: true)
	allowRegisterNonExistent?: boolean,
	//whether events can be added after initialization (default: true)
	canAddEvents?: boolean,
	//whether events can be removed (default: true)
	canRemoveEvents?: boolean,
	//whether to collect registration and trigger stats (default: false)
	collectStats?: boolean,
};

export type LifeEventsAPI = {
	target: Object,
	trigger: Function,
	addEvent: Function,
	removeEvent: Function,
	hasEvent: Function,
	hasEventRegistrations: Function,
};

export type RegItem = {
	name: any,
	cb: Function,
	once: boolean,
};