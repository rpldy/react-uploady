// @flow
import type { UploaderType, UploaderEnhancer } from "./types";

const composeEnhancers =  (...enhancers: UploaderEnhancer[]): ((uploader: UploaderType, ...args: Array<any>) => UploaderType) =>
    (uploader: UploaderType, ...args: any[]) =>
        enhancers.reduce((enhanced: UploaderType, e: UploaderEnhancer) =>
            e(enhanced, ...args) || enhanced, uploader);

export default composeEnhancers;
