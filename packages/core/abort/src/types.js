// @flow

import type { Batch, BatchItem, UploadData, UploadOptions } from "@rpldy/shared";

export type FinalizeRequestMethod = (id: string, data: UploadData) => void;

export type AbortMethod = () => boolean;

export type AbortsMap = { [string]: AbortMethod };

export type AbortResult = { isFast: boolean };

export type AbortBatchMethod = (Batch, UploadOptions, AbortsMap, FinalizeRequestMethod, UploadOptions) => AbortResult;

export type AbortAllMethod = (BatchItem[], AbortsMap, FinalizeRequestMethod, UploadOptions) => AbortResult;

export type AbortItemMethod = (string,  { [string]: BatchItem }, AbortsMap, FinalizeRequestMethod) => boolean;
