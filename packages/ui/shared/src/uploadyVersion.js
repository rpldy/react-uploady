// @flow
import { hasWindow } from "@rpldy/shared";

declare var BUILD_TIME_VERSION: string;

/* istanbul ignore next */
// eslint-disable-next-line no-undef
const VERSION = BUILD_TIME_VERSION || "";

export const GLOBAL_VERSION_SYM: symbol = Symbol.for("_rpldy-version_");

const getVersion = (): string => VERSION;

const getRegisteredVersion = (): string => {
    /* istanbul ignore next */
    const global = hasWindow() ? window : process;
    // $FlowIgnore
    return global[GLOBAL_VERSION_SYM];
};

const registerUploadyContextVersion = (): void => {
    const global = hasWindow() ? window : process;
    //$FlowIgnore
    global[GLOBAL_VERSION_SYM] = VERSION;
};

const getIsVersionRegisteredAndDifferent = (): boolean => {
    const registeredVersion = getRegisteredVersion();
    return !!registeredVersion && registeredVersion !== VERSION;
};

export {
    getVersion,
    getRegisteredVersion,
    registerUploadyContextVersion,
    getIsVersionRegisteredAndDifferent,
};
