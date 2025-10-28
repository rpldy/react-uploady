// @flow
import { devFreeze } from "@rpldy/shared";

export const TUS_EXT: symbol = Symbol.for("__upldy-tus__");

export const TUS_SENDER_TYPE = "rpldy-tus-sender";

export const SUCCESS_CODES = [200, 201, 204];

export const KNOWN_EXTENSIONS = {
    CREATION: "creation",
    CREATION_WITH_UPLOAD: "creation-with-upload",
    TERMINATION: "termination",
    CONCATENATION: "concatenation",
    CREATION_DEFER_LENGTH: "creation-defer-length",
};

export const FD_STORAGE_PREFIX = "rpldy_tus_fd_";

export const TUS_EVENTS: Object = devFreeze({
    RESUME_START: "RESUME_START",
    PART_START: "PART_START"
});
