// @flow
import React, { useCallback, useState } from "react";
import usePreviewsLoader from "./usePreviewsLoader";
import { getFallbackUrl } from "./utils";

import type { Element, ComponentType } from "react";
import type {
    PreviewProps,
    PreviewData,
} from "./types";

/**
 * doesn't render its own container
 */
const UploadPreview = (props: PreviewProps): Element<"img">[] | Element<ComponentType<any>>[] => {
    const [fallbackAttempted, setFallbackAttempted] = useState(false);
    const previews = usePreviewsLoader(props);

    const onImagePreviewLoadError = useCallback((e) => {
        if (!fallbackAttempted) {
            const img = e.target;

            const fallback = getFallbackUrl(props.fallbackUrl, img.src);

            if (fallback) {
                img.src = fallback.url;
            }

            setFallbackAttempted(true);
        }
    }, [fallbackAttempted, props.fallbackUrl]);

    return previews.map((data: PreviewData): Element<any> =>
        props.PreviewComponent ?
            <props.PreviewComponent {...props.previewProps} data={data}/> :
            <img key={data.url}
                 onError={onImagePreviewLoadError}
                 src={data.url} {...props.previewProps} />);
};

export default UploadPreview;
