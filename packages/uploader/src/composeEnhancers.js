// @flow

import type { UploaderType, UploaderEnhancer } from "./types";

export default (...enhancers: UploaderEnhancer[]) =>
    (uploader: UploaderType, ...args: any[]) =>
        enhancers.reduce((enhanced: UploaderType, e: UploaderEnhancer) =>
            e(enhanced, ...args) || enhanced, uploader);
