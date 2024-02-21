import * as React from "react";
import { BatchItem, FileLike } from "@rpldy/shared";

export enum PreviewType {
    IMAGE = "image",
    VIDEO = "video",
}

export type RemovePreviewMethod = (id: string) => void;

export type PreviewItem = {
    id: string;
    url: string;
    name: string;
    type: PreviewType;
    isFallback: boolean;
    removePreview: () => void;
    props: Record<string, unknown>;
};

export type FallbackType = string | PreviewItem;

export type FallbackMethod = (file: FileLike) => FallbackType | void;

export type PreviewComponentPropsMethod = (item: BatchItem, url: string, type: PreviewType) => Record<string, unknown>;

export type PreviewComponentPropsOrMethod = Record<string, unknown> | PreviewComponentPropsMethod;

export type ClearPreviewsMethod = () => void;

export type PreviewMethods = {
    clear: ClearPreviewsMethod;
    removePreview: RemovePreviewMethod;
};

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
    previewMethodsRef?: React.RefObject<PreviewMethods>;
    onPreviewsChanged?: (previews: PreviewItem[]) => void;
}

export type PreviewData = {
    previews: PreviewItem[],
    clearPreviews: ClearPreviewsMethod,
    removeItemFromPreview: RemovePreviewMethod,
};

export type PreviewBatchItemsMethod = (cb: (batch: { items: BatchItem[] }) => void) => void;

export type UploadPreviewType = (props: PreviewProps) => JSX.Element;

export type PreviewsLoaderHook = (props?: PreviewOptions) => PreviewData;

export const getPreviewsLoaderHook: (method: PreviewBatchItemsMethod) => PreviewsLoaderHook;

export const getUploadPreviewForBatchItemsMethod: (method: PreviewBatchItemsMethod) => UploadPreviewType;

export const UploadPreview: UploadPreviewType;

export default UploadPreview;
