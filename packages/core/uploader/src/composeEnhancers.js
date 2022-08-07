// @flow
import type { UploaderType, UploaderEnhancer } from "@rpldy/raw-uploader";
// import type { UploaderCreateOptions } from "./types";

const composeEnhancers =  (...enhancers: UploaderEnhancer<any>[]):
    ((uploader: UploaderType<any>, ...args: Array<any>) => UploaderType<any>) =>
    (uploader: UploaderType<any>, ...args: any[]) =>
        enhancers.reduce((enhanced: UploaderType<any>, e: UploaderEnhancer<any>) =>
            e(enhanced, ...args) || enhanced, uploader);

export default composeEnhancers;
