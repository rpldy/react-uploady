// @flow
import type { Node } from "react";
import type { UploadInfo, UploadOptions, Batch, BatchItem } from "@rpldy/shared";
import type { UploaderCreateOptions } from "@rpldy/uploader";
import type { OnAndOnceMethod, OffMethod, EventCallback } from "@rpldy/life-events";

export type {
    Batch,
    BatchItem
};

export type PreSendData = { items: BatchItem[]; options: UploaderCreateOptions };

export type Callback = (...args?: any) => ?any;
export type WithStateFn<T> = ((fn?: Callback, id?: string) => any) & ((id?: string) => T)

type EventHook<T> = (cb: (obj: T, options: UploaderCreateOptions) => void, id?: string) => void;
type CancellableHook<T> = (cb: (obj: T, options: UploaderCreateOptions) => boolean | void, id?: string) => void;
type EventHookWithState<T> = WithStateFn<T>;

export type ItemEventHook = EventHook<BatchItem>;
export type ItemCancellableEventHook = CancellableHook<BatchItem>;
export type ItemEventHookWithState = EventHookWithState<BatchItem>;

export type BatchEventHook = EventHook<Batch>;
export type BatchCancellableEventHook = (cb: (batch: Batch, options: UploaderCreateOptions) => boolean | void) => void;
export type BatchEventHookWithState = EventHookWithState<Batch>;

export type RefObject<T: mixed> = {current: null | void | T};

export type AddUploadFunction = (files: UploadInfo | UploadInfo[], addOptions: ?UploadOptions) => void;

export type InputRef = { current: ?HTMLInputElement };

export type UploadyContextType = {
    getInternalFileInput: () => ?InputRef,
    setExternalFileInput: (InputRef) => void,
    getIsUsingExternalInput: () => boolean,
    hasUploader: () => boolean,
	showFileUpload: (?UploadOptions) => void,
	upload: AddUploadFunction,
	processPending: (?UploadOptions) => void,
    clearPending: () => void,
    setOptions: (UploaderCreateOptions) => void,
    getOptions: () => UploaderCreateOptions,
	on: OnAndOnceMethod,
	once: OnAndOnceMethod,
	off: OffMethod,
	abort: (id?: string) => void,
	abortBatch: (id: string) => void,
    getExtension: (any) => ?Object,
};

export type UploaderListeners = { [string]: EventCallback };

export type NoDomUploadyProps = {|
    ...UploaderCreateOptions,
    //whether to set debug flag for extra console logs
    debug?: boolean,
    //map of event name and event handler
    listeners?: UploaderListeners,
    inputRef?: InputRef,
    //any part of your React app. Specifically any components that needs access to the uploading flow
    children?: Node,
|};

export type UploadyProps = {|
    ...NoDomUploadyProps,

    //whether a file input element ref will be provided instead of Uploady creating one internally - see: useFileInput (default: false)
    customInput?: boolean,

    //html element to place the file input element inside (default: document.body)
    inputFieldContainer?: HTMLElement,

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
    //name (attribute) of the file input field (default: "file")
    inputFieldName?: string,

    //Dont render Uploady's file input in a portal. (default: false) For SSR, noPortal = false causes a React warning in DEV.
    noPortal?: boolean,
|};

