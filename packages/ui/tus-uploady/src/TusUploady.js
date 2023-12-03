// @flow
import React, { useMemo } from "react";
import { logWarning } from "@rpldy/shared-ui";
import Uploady, { composeEnhancers } from "@rpldy/uploady";
import { CHUNKING_SUPPORT, getTusEnhancer } from "@rpldy/tus-sender";

import type { UploaderEnhancer, UploaderCreateOptions } from "@rpldy/uploader";
import type { TusUploadyProps } from "./types";
import type { TusOptions } from "@rpldy/tus-sender";

const getEnhancer = (options: TusOptions, enhancer: ?UploaderEnhancer<UploaderCreateOptions>) => {
	const tusEnhancer = getTusEnhancer(options);
	return enhancer ? composeEnhancers(tusEnhancer, enhancer) : tusEnhancer;
};

const TusUploady = (props: TusUploadyProps): React$Element<typeof Uploady> => {
	const {
		chunked,
		chunkSize,
		retries,
		parallel,
		version,
		featureDetection,
		featureDetectionUrl,
		onFeaturesDetected,
		resume,
		deferLength,
		overrideMethod,
		sendDataOnCreate,
		storagePrefix,
		lockedRetryDelay,
		forgetOnSuccess,
		ignoreModifiedDateInStorage,
        resumeHeaders,
		...uploadyProps
	} = props;

	const enhancer = useMemo(
		() => CHUNKING_SUPPORT ?
			getEnhancer({
				chunked,
				chunkSize,
				retries,
				parallel,
				version,
				featureDetection,
				featureDetectionUrl,
				onFeaturesDetected,
				resume,
				deferLength,
				overrideMethod,
				sendDataOnCreate,
				storagePrefix,
				lockedRetryDelay,
				forgetOnSuccess,
				ignoreModifiedDateInStorage,
                resumeHeaders
			}, props.enhancer) :
			undefined,
		[
			props.enhancer,
			chunked,
			chunkSize,
			retries,
			parallel,
			version,
			featureDetection,
			featureDetectionUrl,
			onFeaturesDetected,
			resume,
			deferLength,
			overrideMethod,
			sendDataOnCreate,
			storagePrefix,
			lockedRetryDelay,
			forgetOnSuccess,
			ignoreModifiedDateInStorage,
            resumeHeaders
		]);

	return <Uploady {...uploadyProps} enhancer={enhancer}/>;
};

logWarning(CHUNKING_SUPPORT, "This browser doesn't support chunking. Consider using @rpldy/uploady instead");

export default TusUploady;

