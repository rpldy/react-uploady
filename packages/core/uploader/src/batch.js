// @flow
import { BATCH_STATES, createBatchItem, isPromise, getIsBatchItem } from "@rpldy/shared";
import { DEFAULT_FILTER } from "./defaults";
import { getIsFileList } from "./utils";

import type {
    UploadInfo,
    BatchItem,
    Batch,
    FileFilterMethod,
} from "@rpldy/shared";

import type { UploaderCreateOptions } from "./types";

let bCounter = 0;

const processFiles = (batchId: string, files: UploadInfo, isPending: boolean, fileFilter: ?FileFilterMethod): Promise<BatchItem[]> => {
    const filterFn = fileFilter || DEFAULT_FILTER;

    //we need a simple array of (file, url) to pass to filter fn if its provided (files can be recycled batch items)
    const all: any[] = fileFilter ? Array.prototype
        //$FlowExpectedError[method-unbinding] flow 0.153 !!!
        .map.call(files, (f) => getIsBatchItem(f) ? (f.file || f.url) : f) :
        //in case no filter fn, no need to map it
        [];

    return Promise.all(Array.prototype
        //$FlowExpectedError[method-unbinding] flow 0.153 !!!
        .map.call(files, (f, index) => {
            const filterResult = filterFn(all[index], index, all);

            return isPromise(filterResult) ?
                filterResult.then((result) => !!result && f) :
                (!!filterResult && f);
        }))
        .then((filtered) =>
            filtered
                .filter(Boolean)
                .map((f) => createBatchItem(f, batchId, isPending)));
};

const createBatch = (files: UploadInfo | UploadInfo[], uploaderId: string, options: UploaderCreateOptions): Promise<Batch> => {
    bCounter += 1;
    const id = `batch-${bCounter}`;

    const isFileList = getIsFileList(files);

    files = (Array.isArray(files) || isFileList) ? files : [files];

    const isPending = !options.autoUpload;

    return processFiles(id, files, isPending, options.fileFilter)
        .then((items) => {
            return {
                id,
                uploaderId,
                items,
                state: isPending ? BATCH_STATES.PENDING : BATCH_STATES.ADDED,
                completed: 0,
                loaded: 0,
                orgItemCount: items.length,
                additionalInfo: null,
            };
        });
};

export default createBatch;
