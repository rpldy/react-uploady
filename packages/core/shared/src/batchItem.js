// @flow
import { FILE_STATES } from "./consts";
import type { BatchItem, UploadInfo } from "./types";

const BISYM = Symbol.for("__rpldy-bi__");

let iCounter = 0;

const getBatchItemWithUrl = (batchItem: Object, url: string): BatchItem => {
    batchItem.url = url;
    return batchItem;
};

const getBatchItemWithFile = (batchItem: Object, file: Object): BatchItem => {
    batchItem.file = file;
    return batchItem;
};

const isLikeFile = (f: UploadInfo) => f && (f instanceof File || f instanceof Blob || !!(typeof f === "object" && f.name && f.type));

const getIsBatchItem = (obj: any): boolean => {
    return !!(typeof obj === "object" &&
        obj.id && obj.batchId &&
        obj[BISYM] === true);
};

const createBatchItem = (f: UploadInfo, batchId: string, isPending: boolean = false): BatchItem => {
    const isAlreadyBatchItem = getIsBatchItem(f);
    iCounter += (isAlreadyBatchItem) ? 0 : 1;

    //keep existing id for recycled items
    const id = isAlreadyBatchItem && f.id && typeof f.id === "string" ? f.id : `${batchId}.item-${iCounter}`,
        state = isPending ? FILE_STATES.PENDING : FILE_STATES.ADDED;

    let batchItem = {
        id,
        batchId,
        state,
        uploadStatus: 0,
        completed: 0,
        loaded: 0,
        recycled: isAlreadyBatchItem,
        // $FlowIssue[prop-missing] - flow just doesnt understand...
        previousBatch: isAlreadyBatchItem ? f.batchId : null,
    };

    Object.defineProperty(batchItem, BISYM, {
        value: true,
        //need writable to be able to keep prop when unwrapped from simple-state
        writable: true,
    });

    //$FlowIssue[prop-missing] - flow just doesnt understand...
    const fileData = isAlreadyBatchItem ? (f.file || f.url) : f;

    if (typeof fileData === "string") {
        batchItem = getBatchItemWithUrl(batchItem, fileData);
    } else if (isLikeFile(fileData)) {
        batchItem = getBatchItemWithFile(batchItem, fileData);
    } else {
        throw new Error(`Unknown type of file added: ${typeof fileData}`);
    }

    return batchItem;
};

export default createBatchItem;

export {
    getIsBatchItem,
};
