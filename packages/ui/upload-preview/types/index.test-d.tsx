import * as React from "react";
import type { PropsWithChildren } from "react";
import { FileLike } from "@rpldy/shared";
import Uploady, {
    withRequestPreSendUpdate,
    useItemFinalizeListener, WithRequestPreSendUpdateProps
} from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";
import UploadPreview, { PreviewComponentProps, PreviewType, PreviewMethods } from "./index";

const CustomImagePreview = (props: PreviewComponentProps): JSX.Element => {
    return <img src={props.url}/>;
};

const TestUploadPreview: React.FC = () => {
    return <UploadPreview
        fallbackUrl="fallback.com"
        PreviewComponent={CustomImagePreview}
        maxPreviewImageSize={1111}
        maxPreviewVideoSize={9999}/>;
};

const testUploadPreview = (): JSX.Element => {
    return <TestUploadPreview/>;
};

export {
    testUploadPreview,
};


type Crop = {
    aspect?: number | undefined;
    x?: number | undefined;
    y?: number | undefined;
    width?: number | undefined;
    height?: number | undefined;
    unit?: "px" | "%" | undefined;
}

const getBlobFromCanvas = (canvas: HTMLCanvasElement, file: FileLike) =>
    new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error("Canvas is empty"));
            }
        }, file.type);
    });


const cropImage = async (imageUrl: string, file: FileLike, crop: Crop) => {
    const canvas = document.createElement("canvas");
    canvas.width = crop.width || 0;
    canvas.height = crop.height || 0;
    return getBlobFromCanvas(canvas, file);
};

const PreviewButtons = (props: {
    finished: boolean,
    crop?: Crop,
    updateRequest: () => void,
    onUploadCancel: () => void,
    onUploadCrop: () => void
}) => {
    const { finished, crop, updateRequest, onUploadCancel, onUploadCrop } = props;

    return (
        <div>
            <button
                style={{
                    display: !finished && updateRequest && crop ? "block" : "none"
                }}
                onClick={onUploadCrop}
            >
                Upload Cropped
            </button>
            <button
                style={{ display: !finished && updateRequest ? "block" : "none" }}
                onClick={updateRequest}
            >
                Upload without Crop
            </button>
            <button
                style={{
                    display: !finished && updateRequest && crop ? "block" : "none"
                }}
                onClick={onUploadCancel}
            >
                Cancel
            </button>
        </div>
    );
};

interface PreviewWithCropProps extends WithRequestPreSendUpdateProps, PreviewComponentProps {

}

const ItemPreviewWithCrop = withRequestPreSendUpdate((props: PropsWithChildren<PreviewWithCropProps>) => {
    const {
        id,
        url,
        isFallback,
        type,
        updateRequest,
        requestData,
        previewMethods
    } = props;
    const [finished, setFinished] = React.useState(false);
    const [crop] = React.useState<Crop | undefined>();

    useItemFinalizeListener(() => {
        setFinished(true);
    }, id);

    const onUploadCrop = React.useCallback(async () => {
        if (updateRequest && (crop?.height || crop?.width)) {
            requestData.items[0].file = await cropImage(
                url,
                requestData.items[0].file,
                crop
            );
            updateRequest({ items: requestData.items });
        }
    }, [url, requestData, updateRequest, crop]);

    const onUploadCancel = React.useCallback(() => {
        updateRequest(false);
        if (previewMethods.current?.clear) {
            previewMethods.current.clear();
        }
    }, [updateRequest, previewMethods]);

    return isFallback || type !== PreviewType.IMAGE ? (
        <img src={url} alt="fallback img" />
    ) : (
        <>
            {requestData && !finished ? (
                <div>crop</div>
            ) : (
                <img src={url} alt="uploading img" />
            )}
            <PreviewButtons
                finished={finished}
                crop={crop}
                updateRequest={updateRequest}
                onUploadCancel={onUploadCancel}
                onUploadCrop={onUploadCrop}
            />
            <p>{finished ? "FINISHED" : ""}</p>
        </>
    );
});

export default function App(): JSX.Element {
    const previewMethodsRef = React.useRef<PreviewMethods | null>(null);

    return (
        <Uploady
            destination={{ url: "[upload-url]" }}
        >
            <div className="App">
                <h1>Hello React Uploady</h1>
                <UploadButton>Upload Files</UploadButton>
                <br />
                <UploadPreview
                    PreviewComponent={ItemPreviewWithCrop}
                    previewComponentProps={{ previewMethods: previewMethodsRef }}
                    previewMethodsRef={previewMethodsRef}
                    fallbackUrl="https://icon-library.net/images/image-placeholder-icon/image-placeholder-icon-6.jpg"
                />
            </div>
        </Uploady>
    );
}
