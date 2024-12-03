// @flow
import { logger } from "@rpldy/shared";
import { safeLocalStorage } from "@rpldy/safe-storage";
import { DEFAULT_OPTIONS } from "./defaults";

import type { BatchItem } from "@rpldy/shared";
import type { TusOptions } from "./types";

const getPersistKey = (item: BatchItem, options: TusOptions, identifier: ?string) => {
	const itemKey = [
		item.file.name,
		item.file.type,
		item.file.size,
		!options.ignoreModifiedDateInStorage ? item.file.lastModified : null,
		identifier
	]
		.filter(Boolean)
		.join("/");

	return `${options.storagePrefix || DEFAULT_OPTIONS.storagePrefix}${itemKey}`;
};

const persistResumable = (item: BatchItem, uploadUrl: string, options: TusOptions, identifier: ?string) => {
	if (options.resume) {
		safeLocalStorage.setItem(getPersistKey(item, options, identifier),
			JSON.stringify({
				//time not used for anything, just metadata
				time: Date.now(),
				uploadUrl,
			}));
	}
};

// const updateResumableData = (item: BatchItem, options: TusOptions, data: Object, identifier: ?string) => {
//     const key = getPersistKey(item, options, identifier);
//
//     const stored = safeLocalStorage.getItem(key);
//
//     if (stored) {
//         const parsed = JSON.parse(stored);
//
//         safeLocalStorage.setItem(key, {
//             ...parsed,
//             ...data,
//         });
//     }
// };

const retrieveResumable = (item: BatchItem, options: TusOptions, identifier: ?string): string | void => {
	let uploadUrl;
	const key = getPersistKey(item, options, identifier);

	if (options.resume) {
		try {
			const stored = safeLocalStorage.getItem(key);

			if (stored) {
				const parsed = JSON.parse(stored);
				uploadUrl = parsed.uploadUrl;
			}
		} catch (ex) {
			logger.debugLog(`tusSender.resumableStore: failed to retrieve persisted data for key: ${key}`, ex);
		}
	}

	return uploadUrl;
};

const removeResumable = (item: BatchItem, options: TusOptions, identifier: ?string) => {
	const key = getPersistKey(item, options, identifier);
	safeLocalStorage.removeItem(key);
};

const clearResumables = (options: TusOptions) => {
	const prefix = options.storagePrefix || DEFAULT_OPTIONS.storagePrefix;

	for (let i = 0; i < safeLocalStorage.length; i++) {
		const key = safeLocalStorage.key(i);

		if (key && !key.startsWith(prefix)) {
			safeLocalStorage.removeItem(key);
		}
	}
};

export {
	persistResumable,
	retrieveResumable,
	removeResumable,
	clearResumables,
};
