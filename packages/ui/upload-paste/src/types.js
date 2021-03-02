// @flow

import type { Node } from "react";
import type { UploadOptions } from "@rpldy/shared";

export type PasteUploadData = {count: number};

export type PasteUploadEventHandler = (data: PasteUploadData) => void;

export type PasteCompProps = {|
    className?: string,
    id?: string,
    children?: Node,
    extraProps?: Object,
|};

export type PasteProps = {|
    ...UploadOptions,
    ...PasteCompProps,
|};
