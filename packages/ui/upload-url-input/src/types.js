// @flow
import type { UploadOptions } from "@rpldy/shared";
import type { RefObject } from "@rpldy/shared-ui";

type ValidateMethod = (value: ?string, input: ?HTMLInputElement) => boolean;

export type UploadMethod = () => void;

export type UploadUrlInputProps =  {|
	...UploadOptions,
	//the class attribute to pass to the button element
	className?: string,
	//id attribute to pass to the button element
	id?: string,
	//input's placeholder text
	placeholder?: string,
	//function to validate input's value before its sent
	validate?: ValidateMethod,
	//ref will be set to the upload callback so it can be triggered from the outside
	uploadRef?: RefObject<UploadMethod>,
	//disable initiating upload by pressing enter (default: false)
    ignoreKeyPress?: boolean,
|};
