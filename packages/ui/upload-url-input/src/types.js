// @flow
import type { UploadOptions } from "@rpldy/shared";

// export type UploadCallback = (files: UploadInfo | UploadInfo[], addOptions: UploadOptions) => void;

type ValidateMethod = (value: ?string, input: ?HTMLInputElement) => boolean;

export type UploadUrlInputProps =  {|
	...UploadOptions,
	className?: string,
	id?: string,
	placeholder?: string,
	validate?: ValidateMethod,
	uploadRef?: Object,
    ignoreKeyPress?: boolean,
|};
