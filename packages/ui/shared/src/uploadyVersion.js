// @flow
import { hasWindow } from "@rpldy/shared";

export const GLOBAL_VERSION_SYM: symbol = Symbol.for("_rpldy-version_");

const getVersion = (): string => process.env.BUILD_TIME_VERSION || "";

const getRegisteredVersion = (): string => {
    /* istanbul ignore next */
    const global = hasWindow() ? window : process;
    // $FlowIgnore
    return global[GLOBAL_VERSION_SYM];
};

const registerUploadyContextVersion = (): void => {
    const global = hasWindow() ? window : process;
    //$FlowIgnore
    global[GLOBAL_VERSION_SYM] = getVersion();
};

const getIsVersionRegisteredAndDifferent = (): boolean => {
    const registeredVersion = getRegisteredVersion();
    return !!registeredVersion && registeredVersion !== getVersion();
};

export {
    getVersion,
    getRegisteredVersion,
    registerUploadyContextVersion,
    getIsVersionRegisteredAndDifferent,
};
