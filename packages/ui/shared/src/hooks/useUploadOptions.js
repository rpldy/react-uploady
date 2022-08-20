// @flow
import useUploadyContext from "./useUploadyContext";

import type { UploaderCreateOptions } from "@rpldy/uploader";

const useUploadOptions = (options?: UploaderCreateOptions): UploaderCreateOptions => {
    const context = useUploadyContext();

    if (options) {
        context.setOptions(options);
    }

    return context.getOptions();
};

export default useUploadOptions;
