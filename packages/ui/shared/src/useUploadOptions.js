// @flow
import { useContext } from "react";
import assertContext from "./assertContext";
import { UploadyContext } from "./index";

import type { CreateOptions } from "@rpldy/shared";

export default (options: CreateOptions) => {
    const context = assertContext(useContext(UploadyContext));
    context.setOptions(options);
};
