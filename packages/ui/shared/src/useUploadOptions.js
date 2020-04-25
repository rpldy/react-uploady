// @flow
import { useContext } from "react";
import assertContext from "./assertContext";
import { UploadyContext } from "./index";

import type { CreateOptions } from "@rpldy/uploader";

export default (options?: CreateOptions): CreateOptions => {
    const context = assertContext(useContext(UploadyContext));

    if (options) {
        context.setOptions(options);
    }

    return context.getOptions();
};
