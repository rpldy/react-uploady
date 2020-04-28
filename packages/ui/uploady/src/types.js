// @flow
import type { Node } from "react";
import type { CreateOptions } from "@rpldy/uploader";
import type { EventCallback } from "@rpldy/life-events";

export type UploaderListeners = { [string]: EventCallback };

export type UploadyProps = {|
	...CreateOptions,
    //whether to set debug flag for extra console logs
	debug?: boolean,
    //map of event name and event handler
	listeners?: UploaderListeners,

	//whether a file input element ref will be provided instead of Uploady creating one internally - see: useFileInput (default: false)
	customInput?: boolean,

    //html element to place the file input element inside (default: document.body)
    inputFieldContainer?: HTMLElement,
    //any part of your React app. Specifically any components that needs access to the uploading flow
	children?: Node,
    //'capture' file input field attribute - see: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#capture
    capture?: string,
    //'multiple' file input field attribute - see: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#multiple
    multiple?: boolean,
    //'accept' file input field attribute - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept
    accept?: string,
    //'webkitdirectory' file input field attribute - https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory
    webkitdirectory?: boolean,
    //the value to use for the internal file input element
    fileInputId?: string,
|};
