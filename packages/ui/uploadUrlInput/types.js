// @flow
import type { UploadInfo, UploadOptions } from "@rupy/shared";

export type UploadCallback = (files: UploadInfo | UploadInfo[], addOptions: UploadOptions) => void;

export type UploadUrlInputProps = UploadOptions & {
	className?: string,
	id?: string,
	placeholder?: string,
	validate?: (value: ?string, input: ?HTMLInputElement) => boolean,
	uploadRef?: Object,
};