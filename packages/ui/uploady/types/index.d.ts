import * as React from "react";
import { UploadyProps }  from "@rpldy/shared-ui";
import type { InputRef } from "@rpldy/shared-ui";

export * from "@rpldy/shared-ui";

export {
    FILE_STATES,
    BATCH_STATES,
} from "@rpldy/shared";

export const Uploady: React.ComponentType<UploadyProps>;

export default Uploady;

export const useFileInput: (fileInputRef?: InputRef) => InputRef;
