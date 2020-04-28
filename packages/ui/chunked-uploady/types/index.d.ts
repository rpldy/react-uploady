import * as React from "react";
import { UploadyProps } from "@rpldy/uploady";
import { ChunkedOptions } from "@rpldy/chunked-sender";

export * from "@rpldy/uploady";

export interface ChunkedUploadyProps extends UploadyProps, ChunkedOptions {}

export const ChunkedUploady: React.ComponentType<ChunkedUploadyProps>;

export default ChunkedUploady;
