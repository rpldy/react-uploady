// @flow

export type SimpleState<T> = {
	state: T,
	update: ((T) => void) => T,
	unwrap: (?any) => T | any,
}