// @flow
import { logger, safeLocalStorage } from "@rpldy/shared";
import { DEFAULT_OPTIONS } from "../defaults";
import type { BatchItem } from "@rpldy/shared";
import type { TusOptions } from "../types";

const getPersistKey = (item: BatchItem, options: TusOptions) => {
    const itemKey = [
        item.file.name,
        item.file.type,
        item.file.size,
        item.file.lastModified,
    ].join("/");

    return `${options.storagePrefix || DEFAULT_OPTIONS.storagePrefix}${itemKey}`;
};

const persistResumable = (item: BatchItem, uploadUrl: string, options: TusOptions) => {
    if (options.resume) {
        safeLocalStorage.setItem(getPersistKey(item, options), JSON.stringify({
            //time not used for anything, just metadata
            time: Date.now(),
            expiration: 0,
            uploadUrl,
        }));
    }
};

const updateResumableData = (item: BatchItem, options: TusOptions, data: Object) => {
    const key = getPersistKey(item, options);

    const stored = safeLocalStorage.getItem(key);

    if (stored) {
        const parsed = JSON.parse(stored);

        safeLocalStorage.setItem(key, {
            ...parsed,
            ...data,
        });
    }
};

const retrieveResumable = (item: BatchItem, options: TusOptions) => {
    let uploadUrl;
    const key = getPersistKey(item, options);

    if (options.resume) {
        try {
            const stored = safeLocalStorage.getItem(key);

            if (stored) {
                const parsed = JSON.parse(stored);

                if (!parsed.expiration || parsed.expiration > Date.now()) {
                    uploadUrl = parsed.uploadUrl;
                }
            }
        } catch (ex) {
            logger.debugLog(`tusSender.resumableStore: failed to retrieve persisted data for key: ${key}`, ex);
        }
    }

    return uploadUrl;
};

const removeResumable = (item: BatchItem, options: TusOptions) => {
    const key = getPersistKey(item, options);
    safeLocalStorage.removeItem(key);
};

const clearResumables = () => {

};

export {
    persistResumable,
    retrieveResumable,
    updateResumableData,
    removeResumable,
    clearResumables,
};
