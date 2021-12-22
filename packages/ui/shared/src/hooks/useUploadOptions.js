// @flow
import useUploadyContext from "./useUploadyContext";

import type { CreateOptions } from "@rpldy/uploader";

const useUploadOptions = (options?: CreateOptions): CreateOptions => {
    const context = useUploadyContext();

    if (options) {
        context.setOptions(options);
    }

    return context.getOptions();
};

export default useUploadOptions;
