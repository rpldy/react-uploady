import * as React from "react";
import { BatchItem } from "@rpldy/shared";

export enum PreviewType {
    IMAGE = "image",
    VIDEO = "video",
}

export type PreviewData = {
    url: string;
    type: PreviewType;
    props: object;
};

export type FallbackType = string | PreviewData;

export type FallbackMethod = (file: object) => FallbackType | void;

export type PreviewComponentPropsMethod = (item: BatchItem, url: string, type: PreviewType) => object;

export type PreviewComponentPropsOrMethod = object | PreviewComponentPropsMethod;

export interface PreviewOptions {
    rememberPreviousBatches?: boolean;
    loadFirstOnly?: boolean;
    maxPreviewImageSize?: number;
    maxPreviewVideoSize?: number;
    fallbackUrl?: string | FallbackMethod;
    imageMimeTypes?: string[];
    videoMimeTypes?: string[];
    previewComponentProps?: PreviewComponentPropsOrMethod;
}

export type PreviewComponentProps = {
    url: string;
    type: PreviewType;
    [key: string]: any;
};

export interface PreviewProps extends PreviewOptions {
    PreviewComponent?: React.ComponentType<PreviewComponentProps>;
}

export const UploadPreview: (props: PreviewProps) => JSX.Element;

export default UploadPreview;
