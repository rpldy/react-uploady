// @flow
import addLife, { isLE } from "./lifeEvents";
import type {
	LifeEventsAPI,
	EventCallback,
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
	OnAndOnceMethod,
	OffMethod,
};