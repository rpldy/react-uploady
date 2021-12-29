# Multi Crop

This guide shows how to implement cropping for all images in a batch. Unlike the [Crop](Crop.md) guide that shows how to do crop for a single image request.

After the user chooses the files to upload, the [BATCH_START](../packages/uploader#uploader_eventsbatch_start) event can be used to augment/change the data that will be sent to the server.
This is the perfect time to allow the user to crop their images and replace the selected files with the crop action result.

For this guide, we use [@rpldy/upload-preview](../packages/ui/upload-preview) together with the [withBatchStartUpdate](../packages/ui/uploady/README.md#withBatchStartUpdate) HOC.
_upload-preview_ allows us to use a custom preview component and _withBatchStartUpdate_ makes it easy to intercept the upload data and change it when we're ready.

In the example below, to get the batch ID and pass it to `withBatchStartUpdate` we use the [useBatchAddListener](../packages/ui/uploady/README.md#usebatchaddlistener-event-hook) event hook.
We also hide the upload button while a batch is in progress so user can't add more files until the current batch is uploaded for simplicity's sake.
This is done to simplify the example. It is possible to make this code work for multiple batches or at least to allow selection while upload is in progress.
This is outsude the scope of this guide.

## Code

We use [react-image-crop](https://www.npmjs.com/package/react-image-crop) for the cropping functionality.

### Imports and styled components 

```javascript
    import React, { useCallback, useState } from "react";
    import styled, { css } from "styled-components";
    import ReactCrop from "react-image-crop";
	import "react-image-crop/dist/ReactCrop.css";
    import Uploady, {
        useItemFinalizeListener,
        withBatchStartUpdate,
        useBatchAddListener,
        useBatchFinalizeListener,
        useBatchProgressListener,
    } from "@rpldy/uploady";
    import UploadButton from "@rpldy/upload-button";
    import UploadPreview from "@rpldy/upload-preview";
    import cropImage from "./my-fancy-canvas-cropper";

    const MultiCropContainer = styled.div`
        display: flex;
        flex-direction: column;
    `;
    
    const dotCss = css`
        &:before {
            content: "";
            width: 12px;
            height: 12px;
            position: absolute;
            top: 1px;
            right: 1px;
            background-color: #00ff4e;
            border: 1px solid #eeeeee;
            border-radius: 100%;
        }
    `;
    
    const finishedCss = css`
        &:after {
            content: "";
            position: absolute;
            z-index: 10;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            background-color: rgba(34, 34, 34, 0.6);
        }
    
        cursor: default;
    `;
    
    const ItemPreviewImgWrapper = styled.div`
        margin-right: 10px;
        position: relative;
        cursor: pointer;
    
        ${({ $isCropped }) => $isCropped ? dotCss : ""}
    
        ${({ $isFinished }) => $isFinished ? finishedCss : ""}
    `;
    
    const ItemPreviewImg = styled.img`
        max-height: 160px;
        max-width: 160px;
    
        transition: box-shadow 0.5s;
    
        &:hover {
            box-shadow: 0 0 1px 2px #222222;
        }
    `;
    
    const PreviewsContainer = styled.div`
        display: flex;
        margin-bottom: 20px;
    `;

    const CropperContainer = styled.div`
        display: flex;
        flex-direction: column;
    `;
```

### Item Preview

Instead of using Uploady's UploadPreview component to show the crop as we did in the [Crop](Crop.md) guide, we use the previews to show 
thumbnails of the uploading files. Clicking on one will open the crop view. This makes it possible for the user to switch between the different images
and apply crop where desired.

```javascript

  const ItemPreviewThumb = ({ id, url, onPreviewSelected, isCroppedSet, isFinished }) => {
        const onPreviewClick = () => {
            if (!isFinished) {
                onPreviewSelected({ id, url });
            }
        };
    
        return <ItemPreviewImgWrapper
            $isCropped={isCroppedSet}
            $isFinished={isFinished}
        >
            <ItemPreviewImg
                className={`preview-thumb ${isFinished ? "finished" : (isCroppedSet ? "cropped" : "")}`}
                onClick={onPreviewClick}
                src={url}
            />
        </ItemPreviewImgWrapper>
    };
```

### Cropper

Here we implement our cropping component. Nothing special, just use the 3rd party ReactCrop and allow user
to set the crop for the batch item.

```javascript
    const CropperForMultiCrop = ({ item, url, setCropForItem }) => {
        const [crop, setCrop] = useState({ height: 100, width: 100, x: 50, y: 50 });
    
        const onSaveCrop = async () => {
            const cropped = await cropImage(url, item.file, crop);
            setCropForItem(item.id, cropped);
        };
    
        const onUnsetCrop = () => {
            setCropForItem(item.id, null);
        };
    
        return (<CropperContainer>
            <StyledReactCrop
                src={url}
                crop={crop}
                onChange={setCrop}
                onComplete={setCrop}
            />
            <Button onClick={onSaveCrop} id="save-crop-btn">Save Crop</Button>
            <Button onClick={onUnsetCrop} id="unset-crop-btn">Dont use Crop</Button>
        </CropperContainer>);
    };
```

### Batch Crop

This is the main component of the example. It uses the `withBatchStartUpdate` HOC. This gives it access to the items
being uploaded and to the `updateRequest` method, which is how we update the data before it's passed to the sender.

We also mark the item as cropped and finished ([useItemFinalizeListener](../packages/ui/uploady/README.md#useItemFinalizeListener-event-hook) event hook) according to the data we have. 

```javascript

    const BatchCrop = withBatchStartUpdate((props) => {
        const { id, updateRequest, requestData, uploadInProgress } = props;
        const [selected, setSelected] = useState({ url: null, id: null });
        const [finishedItems, setFinishedItems] = useState([]);
        const [cropped, setCropped] = useState({});
        const hasData = !!(id && requestData);
        const selectedItem = !!selected && requestData?.items.find(({ id }) => id === selected.id);
    
        const setCropForItem = (id, data) => {
            setCropped((cropped) => ({ ...cropped, [id]: data }));
        };
    
        const onUploadAll = () => {
            if (updateRequest) {
                const readyItems = requestData.items
                    .map((item) => {
                        item.file = cropped[item.id] || item.file;
                        return item;
                    });
    
                updateRequest({ items: readyItems });
            }
        };
    
        useItemFinalizeListener(({ id }) => {
            setFinishedItems((finished) => finished.concat(id))
        });
    
        const getPreviewCompProps = useCallback((item) => {
            return ({
                onPreviewSelected: setSelected,
                isCroppedSet: cropped[item.id],
                isFinished: !!~finishedItems.indexOf(item.id),
            });
        }, [cropped, setSelected, finishedItems]);
    
        return (<MultiCropContainer>
            {hasData && !uploadInProgress &&
            <Button onClick={onUploadAll} id="upload-all-btn">Upload All</Button>}
    
            <PreviewsContainer>
                <UploadPreview
                    rememberPreviousBatches
                    PreviewComponent={ItemPreviewThumb}
                    fallbackUrl="https://icon-library.net/images/image-placeholder-icon/image-placeholder-icon-6.jpg"
                    previewComponentProps={getPreviewCompProps}
                />
            </PreviewsContainer>
            {selectedItem && hasData && !uploadInProgress &&
            <CropperForMultiCrop
                {...selected}
                item={selectedItem}
                setCropForItem={setCropForItem}
            />}
        </MultiCropContainer>);
    });
```

### Multi Crop Queue

The MultiCropQueue component kicks things off by using the [useBatchAddListener](../packages/ui/uploady/README.md#usebatchaddlistener-event-hook) event hook.
Once a batch as added, we can listen to its start event. This is done by the `withBatchStartUpdate` HOC and our component (BatchCrop) component it wraps.

Finally, our App component just needs to render everything inside an Uploady instance, and we're good to go.

```javascript

    const MultiCropQueue = () => {
        const [currentBatch, setCurrentBatch] = useState(null);
        const [inProgress, setInProgress] = useState(false);
    
        useBatchAddListener((batch) => setCurrentBatch(batch.id));
    
        useBatchFinalizeListener(() => {
            setCurrentBatch(null);
            setInProgress(false);
        });
    
        useBatchProgressListener(() => {
            if (!inProgress) {
                setInProgress(true);
            }
        });
    
        return (
            <div>
                {inProgress &&
                <h2>Uploading...</h2>}
    
                {!currentBatch &&
                <StyledUploadButton id="upload-btn">
                    Select Files
                </StyledUploadButton>}
    
                <BatchCrop
                    id={currentBatch}
                    uploadInProgress={inProgress}
                />
            </div>
        );
    };
    
    export const App = () => {
        return <Uploady
            destination={{ url: "my-server.com/upload" }}
        >
            <MultiCropQueue  />
        </Uploady>;
    };
```
