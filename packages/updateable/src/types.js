// @flow

export type Updateable<T> = {
	state: T,
	update: ((T) => void) => T,
	unwrap: (?Object) => T | Object,
}