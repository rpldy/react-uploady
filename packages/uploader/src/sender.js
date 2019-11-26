// @flow

//TODO: need to support grouping of files into single request

import { FILE_STATES } from "@rupy/shared";
import type { BatchItem } from "../types";
import type { FileState } from "@rupy/shared";

export type SendOptions = {
	method: string,
	paramName: string,
	params: Object,
	encoding: string,
};

export type UploadData = {
	state: FileState,
	data: any,
};

export default async (item: BatchItem, url: string, options: SendOptions): Promise<UploadData> => {

	console.log("!!!!!!!! sending file: ", { item, url, options, });


	return {
		state: FILE_STATES.FINISHED,
		data: {},
	}


};
