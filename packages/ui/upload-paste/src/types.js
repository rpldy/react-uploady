// @flow

import type { Node } from "react";
import type { UploadOptions } from "@rpldy/shared";

export type PasteUploadData = { count: number };

export type PasteUploadHandler = (data: PasteUploadData) => void;

export type PasteCompProps = {|
    className?: string,
    id?: string,
    children?: Node,
    extraProps?: Object,
    onPasteUpload?: PasteUploadHandler,
|};

export type PasteProps = {|
    ...UploadOptions,
    ...PasteCompProps,
|};

export type PasteUploadHookResult = { toggle: () => boolean, getIsEnabled: boolean};

export type PasteUploadHook = (UploadOptions, ?DOMElement, PasteUploadHandler) => PasteUploadHookResult;
