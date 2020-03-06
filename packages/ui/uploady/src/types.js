// @flow
import type { Node } from "react";
import type { CreateOptions } from "@rpldy/shared";
// import type { UploaderEnhancer } from "@rpldy/uploader";
import type { EventCallback } from "@rpldy/life-events";

export type UploaderListeners = { [string]: EventCallback };

export type UploadyProps = {|
	...CreateOptions,
	// destination?: Destination,
	// uploader?: UploaderType,
    // //uploader enhancer function
	// enhancer?: UploaderEnhancer,
    //the field name to use for the file input element
	// inputFieldName?: string,
    //whether to set debug flag for extra console logs from the uploader module
	debug?: boolean,
    //
	listeners?: UploaderListeners,
    //
	children?: Node,
    //'capture' file input field attribute - see: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#capture
    capture?: string,
    //'multiple' file input field attribute - see: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#multiple
    multiple?: boolean,
    //'accept' file input field attribute - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept
    accept?: string,
    //'webkitdirectory' file input field attribute - https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory
    webkitdirectory?: boolean,
|};
