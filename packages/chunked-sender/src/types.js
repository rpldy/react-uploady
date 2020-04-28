// @flow

export type ChunkedOptions = {|
	//whether to divide the uploaded file into chunks (default: true)
	chunked?: boolean,
	//the maximum chunk size (default: 5242880 bytes)
	chunkSize?: number,
	//the number of times to retry a failed chunk (default: 0)
	retries?: number,
	//the number of chunks to upload in parallel (default: 0)
	parallel?: number,
|};

export type MandatoryChunkedOptions = {|
    chunked: boolean,
    chunkSize: number,
    retries: number,
    parallel: number,
|};
