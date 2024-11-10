// @flow
import { logger, request, merge } from "@rpldy/shared";
import { safeSessionStorage } from "@rpldy/safe-storage";
import {
	SUCCESS_CODES,
	KNOWN_EXTENSIONS,
	FD_STORAGE_PREFIX
} from "./consts";

import type { TusState, RequestResult } from "./types";

const getStorageKey = (url: string) => `${FD_STORAGE_PREFIX}${url}`;

type ConverterFn = (extensions: string[], tusState: TusState) => void;

const optionsConverter: { [string]: ConverterFn } = {
	[KNOWN_EXTENSIONS.CONCATENATION]: (extensions: string[], tusState: TusState) => {
		const parallel = tusState.getState().options.parallel;

		if (+parallel > 1 &&
			!~extensions.indexOf(KNOWN_EXTENSIONS.CONCATENATION)) {

			logger.debugLog(`tusSender.featureDetection: disabling parallel uploads, ${KNOWN_EXTENSIONS.CONCATENATION} extension not available`);
			tusState.updateState((state) => {
				state.options.parallel = 1;
			});
		}
	},

	[KNOWN_EXTENSIONS.CREATION_WITH_UPLOAD]: (extensions: string[], tusState: TusState) => {
		if (tusState.getState().options.sendDataOnCreate &&
			!~extensions.indexOf(KNOWN_EXTENSIONS.CREATION_WITH_UPLOAD)) {

			logger.debugLog(`tusSender.featureDetection: disabling create with data, ${KNOWN_EXTENSIONS.CREATION_WITH_UPLOAD} extension not available`);
			tusState.updateState((state) => {
				state.options.sendDataOnCreate = false;
			});
		}
	},

	[KNOWN_EXTENSIONS.CREATION_DEFER_LENGTH]: (extensions: string[], tusState: TusState) => {
		if (tusState.getState().options.deferLength &&
			!~extensions.indexOf(KNOWN_EXTENSIONS.CREATION_DEFER_LENGTH)) {

			logger.debugLog(`tusSender.featureDetection: disabling defer length, ${KNOWN_EXTENSIONS.CREATION_DEFER_LENGTH} extension not available`);
			tusState.updateState((state) => {
				state.options.deferLength = false;
			});
		}
	},
};

const processResponse = (tusState: TusState, extensions: ?string, version: ?string): void => {
	const { options } = tusState.getState();

	if (extensions) {
		logger.debugLog(`tusSender.featureDetection: retrieved extensions from server`, extensions);

		const extArr = extensions.split(",");

		if (extArr.length && options.onFeaturesDetected) {
			const updatedOptions = options.onFeaturesDetected(extArr);

			if (updatedOptions) {
				tusState.updateState((state) => {
					state.options = merge({}, state.options, updatedOptions);
				});
			}
		} else {
			Object.entries(optionsConverter).forEach(([key, converter]) => {
                converter(extArr, tusState);
			});
		}
	}

	if (version && version !== tusState.getState().options.version) {
		logger.debugLog(`tusSender.featureDetection: setting version to server version: ${version}`);

		tusState.updateState((state) => {
			state.options.version = version;
		});
	}

	tusState.updateState((state) => {
		state.featureDetection = {
			processed: true,
			version,
			extensions,
		};
	});
};

const handleResponse = (pXhr: Promise<XMLHttpRequest>, url: string, tusState: TusState): Promise<void> =>
    pXhr
        .catch((error) => {
            logger.debugLog(`tusSender.featureDetection: failed to retrieve data from server`, error);
        })
        .then((response: ?XMLHttpRequest) => {
            if (response && ~SUCCESS_CODES.indexOf(response.status)) {
                const tusExtensions = response.getResponseHeader("Tus-Extension");
                const tusVersion = response.getResponseHeader("Tus-Resumable");

                if (tusExtensions) {
                    safeSessionStorage.setItem(getStorageKey(url),
                        JSON.stringify({
                            extensions: tusExtensions,
                            versions: tusVersion,
                        }));
                }

                processResponse(tusState, tusExtensions, tusVersion);
            }
        });

export const requestFeaturesFromServer = (url: string, tusState: TusState): {|abort: () => boolean, request: Promise<void>|} => {
	const { options } = tusState.getState();

	const pXhr = request(url, null, {
		method: "OPTIONS",
		headers: {
			"tus-resumable": options.version,
		}
	});

	return {
		request: handleResponse(pXhr, url, tusState),
		abort: () => {
			pXhr.xhr.abort();
			return true;
		},
	};
};

const handleStoredValue = (url: string, tusState: TusState, storedFd: string): ?RequestResult<void> => {
	let parsed;

	try {
		parsed = JSON.parse(storedFd);
		if (parsed?.extensions) {
		    const { extensions, version } = parsed;
			logger.debugLog(`tusSender.featureDetection: retrieved feature detection data from session storage`, parsed);
			processResponse(tusState, extensions, version);
		} else{
			parsed = null;
		}
	} catch (ex) { // eslint-disable-line
		logger.debugLog(`tusSender.featureDetection: failed to load feature detection data from session storage`);
	}

	if (!parsed) {
		safeSessionStorage.removeItem(getStorageKey(url));
	}

	return parsed ?
		null :
		requestFeaturesFromServer(url, tusState);
};

const featureDetection = (url: string, tusState: TusState): ?RequestResult<void> => {
    let result;
    const { options, featureDetection } = tusState.getState();

    const usedUrl = options.featureDetectionUrl || url;
    logger.debugLog(`tusSender.featureDetection: about to request server info`, usedUrl);

    const storedFd = safeSessionStorage.getItem(getStorageKey(usedUrl));

    if (!featureDetection.processed) {
        result = storedFd ?
            handleStoredValue(usedUrl, tusState, storedFd) :
            requestFeaturesFromServer(usedUrl, tusState);
    }

    return result;
};

export default featureDetection;
