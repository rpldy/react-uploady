// @flow
import type { RawCreateOptions } from "@rpldy/raw-uploader";
import type { Batch, BatchItem, UploadData,  } from "@rpldy/shared";

export type FinalizeRequestMethod = (id: string, data: UploadData) => void;

export type AbortMethod = () => boolean;

export type AbortsMap = { [string]: AbortMethod };

export type AbortResult = { isFast: boolean };

type InExactRawCreateOptions = { ...RawCreateOptions };

export type AbortBatchMethod = (Batch, InExactRawCreateOptions, AbortsMap, FinalizeRequestMethod, InExactRawCreateOptions) => AbortResult;

export type AbortAllMethod = ({ [string]: BatchItem }, AbortsMap, FinalizeRequestMethod, InExactRawCreateOptions) => AbortResult;

export type AbortItemMethod = (string, { [string]: BatchItem }, AbortsMap, FinalizeRequestMethod) => boolean;

export type AbortMethodsOptions = {|
    //
    abortAll?: AbortAllMethod,
    //
    abortBatch?: AbortBatchMethod,
    //
    abortItem?: AbortItemMethod,
|};

export type CreateOptionsWithAbort = {|
    ...RawCreateOptions,
    ...AbortMethodsOptions,
|};
