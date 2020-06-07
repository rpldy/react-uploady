import * as React from "react";
import { BatchItem, FileLike } from "@rpldy/shared";

export enum PreviewType {
    IMAGE = "image",
    VIDEO = "video",
}

export type PreviewData = {
    id: string;
    name: string;
    url: string;
    type: PreviewType;
    props: Record<string, unknown>;
};

export type FallbackType = string | PreviewData;

export type FallbackMethod = (file: FileLike) => FallbackType | void;

export type PreviewComponentPropsMethod = (item: BatchItem, url: string, type: PreviewType) => Record<string, unknown>;

export type PreviewComponentPropsOrMethod = Record<string, unknown> | PreviewComponentPropsMethod;

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
