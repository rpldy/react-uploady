import * as React from "react";
import { UploadyProps } from "@rpldy/uploady";
import { TusOptions } from "@rpldy/tus-sender";

export * from "@rpldy/uploady";

export interface TusUploadyProps extends UploadyProps, TusOptions {}

export const TusUploady: React.ComponentType<TusUploadyProps>;

export default TusUploady;

export type ClearResumableStore = () => void;

export const useClearResumableStore: () => ClearResumableStore;
