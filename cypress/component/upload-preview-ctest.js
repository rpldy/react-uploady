import React, { useCallback, useRef, useState, } from "react";
import { flushSync } from "react-dom";
import styled from "styled-components";
import Uploady, {
    useItemFinalizeListener,
    withRequestPreSendUpdate,
    useItemStartListener,
    useBatchAddListener
} from "@rpldy/uploady";
import UploadPreview, { PREVIEW_TYPES } from "@rpldy/upload-preview";
import UploadButton from "@rpldy/upload-button";
import ReactCropWithImage from "../../story-helpers/ReactCropWithImage";
import intercept from "../integration/intercept";
import uploadFile from "../integration/uploadFile";
import { DEFAULT_URL } from "../constants";

const ButtonsWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 10px;
`;

const PreviewButtons = (props) => {
    const { finished, crop, updateRequest, onUploadCancel, onUploadCrop } = props;

    return <ButtonsWrapper>
        <button id="crop-btn" className="preview-crop-btn"
                style={{ display: !finished && updateRequest && crop ? "block" : "none" }}
                onClick={onUploadCrop}>
            Upload Cropped
        </button>
        <button id="full-btn" style={{ display: !finished && updateRequest ? "block" : "none" }}
                onClick={updateRequest}>
            Upload without Crop
        </button>
        <button id="cancel-btn" style={{ display: !finished && updateRequest && crop ? "block" : "none" }}
                onClick={onUploadCancel}>
            Cancel
        </button>
    </ButtonsWrapper>;
};

const PreviewContainer = styled.div`
    display: flex;
    flex-wrap: wrap;

    img {
        margin: 5px;
        max-width: 200px;
        height: auto;
        max-height: 200px;
    }
`;

const ItemPreviewWithCrop = withRequestPreSendUpdate((props) => {
    const { id, url, isFallback, type, updateRequest, requestData, previewMethods } = props;
    const [finished, setFinished] = useState(false);
    const [crop, setCrop] = useState({ unit: "px", height: 100, width: 100, x: 50, y: 50 });
    const imgRef = useRef(null);

    useItemFinalizeListener(() => {
        setFinished(true);
    }, id);

    const onUploadCrop = useCallback(async () => {
        if (updateRequest && (crop?.height || crop?.width)) {
            const { blob } = await cropImage(imgRef.current, requestData.items[0].file, crop);
            requestData.items[0].file = blob;
            updateRequest({ items: requestData.items });
        }
    }, [url, requestData, updateRequest, crop]);

    const onUploadCancel = useCallback(() => {
        updateRequest(false);
        if (previewMethods.current?.clear) {
            previewMethods.current.clear();
        }
    }, [updateRequest, previewMethods]);

    return isFallback || type !== PREVIEW_TYPES.IMAGE ?
        <PreviewContainer>
            <img src={url} alt="fallback img" id="fallback-preview"/>
        </PreviewContainer> :
        <>
            {requestData ?
                <ReactCropWithImage
                    src={url}
                    crop={crop}
                    ref={imgRef}
                    onCrop={setCrop}
                /> : null}
            <PreviewButtons
                finished={finished}
                crop={crop}
                updateRequest={updateRequest}
                onUploadCancel={onUploadCancel}
                onUploadCrop={onUploadCrop}
            />
            <p>{finished ? "FINISHED" : ""}</p>
        </>;
});

const WithFlush = () => {
    useBatchAddListener(() => {
        console.log("FLUSH!!!!!");
        flushSync();
    });

    return null;
};

const WithCrop = () => {
    const previewMethodsRef = useRef(null);

    return <Uploady
        debug
        multiple={false}
        destination={{ url: DEFAULT_URL }}
    >
        <WithFlush/>
        <UploadButton id="upload-btn">
            Upload
        </UploadButton>

        <UploadPreview
            PreviewComponent={ItemPreviewWithCrop}
            previewComponentProps={{ previewMethods: previewMethodsRef }}
            previewMethodsRef={previewMethodsRef}
            fallbackUrl="https://picsum.photos/50"
        />
    </Uploady>;
};

describe("UploadPreview - Component Tests", () => {
    const fileName = "flower.jpg";

    it("UploadPreview - should show upload crop before upload", () => {
        intercept();

        cy.mount(<WithCrop/>);

        uploadFile(fileName, () => {

        }, "#upload-btn");
    });

});
