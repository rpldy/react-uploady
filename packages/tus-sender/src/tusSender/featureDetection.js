// @flow
import { logger, request } from "@rpldy/shared";
import { SUCCESS_CODES, KNOWN_EXTENSIONS } from "./consts";

import type { TusState } from "./types";

const optionsConverter = {
	[KNOWN_EXTENSIONS.CONCATENATION]: (extensions: string[], tusState: TusState) => {
	},

	[KNOWN_EXTENSIONS.CREATION_WITH_UPLOAD]: (extensions: string[], tusState: TusState) => {
	},

	[KNOWN_EXTENSIONS.CREATION_DEFER_LENGTH]: (extensions: string[], tusState: TusState) => {
	},
};

const handleResponse = async (pXhr: Promise<XMLHttpRequest>, tusState: TusState) => {
	try {
		const response = await pXhr;

		if (~SUCCESS_CODES.indexOf(response.status)) {
			const tusExtensions = response.getResponseHeader("Tus-Extension");
			const tusVersion = response.getResponseHeader("Tus-Resumable");

			if (tusExtensions) {
				logger.debugLog(`tusSender.featureDetection: retrieved extensions from server`, tusExtensions);

				const extArr = tusExtensions.split(",");

				Object.keys(optionsConverter).forEach((key: string) => {
					optionsConverter[key](extArr, tusState);
				});
			}

			if (tusVersion && tusVersion !== tusState.getState().options.version) {
				logger.debugLog(`tusSender.featureDetection: setting version to server version: ${tusVersion}`);

				tusState.updateState((state) => {
					state.options.version = tusVersion;
				});
			}
		}
	} catch (ex) {
		logger.debugLog(`tusSender.featureDetection: failed to retrieve data from server`, ex);
	}
};

export default (url: string, tusState: TusState) => {
	const { options } = tusState.getState();

	url = options.featureDetectionUrl || url;

	logger.debugLog(`tusSender.featureDetection: about to request server info`, url);

	const pXhr = request(url, null, {
		method: "OPTIONS",
		headers: {
			"tus-resumable": options.version,
		}
	});

	return {
		request: handleResponse(pXhr, tusState),
		abort: () => {
			// $FlowFixMe
			pXhr.xhr.abort();
			return true;
		},
	};
};