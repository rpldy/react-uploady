// @flow
import type { UploadyProps } from "@rpldy/uploady";
import type { TusOptions } from "@rpldy/tus-sender";

export type TusUploadyProps = {|
	...UploadyProps,
	...$Exact<TusOptions>,
|}
