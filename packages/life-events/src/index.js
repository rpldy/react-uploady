// @flow
import addLife, { isLE } from "./lifeEvents";
import type {
	LifeEventsAPI,
	EventCallback,
	TriggerMethod,
	OnAndOnceMethod,
	OffMethod,
} from "./types";

export default addLife;

export {
	isLE,
};

export type {
	LifeEventsAPI,
	EventCallback,
	TriggerMethod,
	OnAndOnceMethod,
	OffMethod,
};