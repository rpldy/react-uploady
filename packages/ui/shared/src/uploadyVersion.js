// @flow
import { hasWindow } from "@rpldy/shared";

export const GLOBAL_VERSION_SYM: symbol = Symbol.for("_rpldy-version_");

const getVersion = (): string => process.env.BUILD_TIME_VERSION || "";

const getGlobal = () =>
    /* istanbul ignore next */
    hasWindow() ? window : (globalThis || process);

const getRegisteredVersion = (): string => {
    const global = getGlobal();
    return (global: Object)[GLOBAL_VERSION_SYM];
};

const registerUploadyContextVersion = (): void => {
    const global =getGlobal();
    (global: Object)[GLOBAL_VERSION_SYM] = getVersion();
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
