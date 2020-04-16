// @flow

import type { UploadyProps } from "@rpldy/uploady";
import type { ChunkedOptions } from "@rpldy/chunked-sender";

export type ChunkedUploadyProps = {|
	...UploadyProps,
	...ChunkedOptions,
|};
