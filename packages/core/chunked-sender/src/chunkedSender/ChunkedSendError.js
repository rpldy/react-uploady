// @flow

export default class ChunkedSendError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "ChunkedSendError";
	}
}
