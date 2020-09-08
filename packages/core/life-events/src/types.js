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

export type TriggerMethod = (name: any, ...args: any[]) => any;

export type LifeEventsAPI = {
	target: Object,
	trigger: TriggerMethod,
	addEvent: (name: any) => void,
	removeEvent: (name: any) => void,
	hasEvent: (name: any) => boolean,
	hasEventRegistrations: (name: any) => boolean,
};

export type EventCallback = (...args: any[]) => any;

export type OffMethod = (name: any, cb?: EventCallback) => void;

export type OnAndOnceMethod = (name: any, cb: EventCallback) => OffMethod;

export type RegItem = {
	name: any,
	cb: EventCallback,
	once: boolean,
};
