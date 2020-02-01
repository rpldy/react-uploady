// @flow

export default class ChunkedSendError extends Error {
	constructor(message) {
		super(message);
		this.name = "ChunkedSendError";
	}
}
