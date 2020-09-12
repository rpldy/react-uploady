// @flow
import type { UploadyProps } from "@rpldy/shared-ui";
import type { TusOptions } from "@rpldy/tus-sender";

export type TusUploadyProps = {|
	...UploadyProps,
	...$Exact<TusOptions>,
|}
