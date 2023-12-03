// @flow
import React, { useCallback, useState, useRef, useEffect, type Node } from "react";
import styled,  { css } from "styled-components";
import { number } from "@storybook/addon-knobs";
import Uploady, {
    useItemProgressListener,
    useItemFinalizeListener,
    withRequestPreSendUpdate,
    withBatchStartUpdate,
    useBatchAddListener,
    useBatchStartListener,
    useBatchFinalizeListener,
    useBatchProgressListener,
    useRequestPreSend,
    useUploady,
    useAbortItem,
} from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";
import UploadUrlInput from "@rpldy/upload-url-input";
import {
    KNOB_GROUPS,
    useStoryUploadySetup,
    uploadButtonCss,
    uploadUrlInputCss,
    cropImage,
    getCsfExport,
    ReactCropWithImage,

    type CropData,
    type CsfExport,
} from "../../../story-helpers";
import UploadPreview, {
    getUploadPreviewForBatchItemsMethod,
    PREVIEW_TYPES
} from "./src";
import readme from "./README.md";

import type { Batch, BatchItem } from "@rpldy/shared";
import type { UploaderCreateOptions } from "@rpldy/uploader";
import type { PreviewItem, RemovePreviewMethod, PreviewProps, PreviewMethods } from "./src";

type StateSetter<T> = ((T => ?T) | ?T) => void;

// type CropData = { height: number, width: number, x: number, y: number };

const StyledUploadButton = styled(UploadButton)`
	${uploadButtonCss}
`;

const usePreviewStorySetup = () => {
    const setup = useStoryUploadySetup();
    const maxImageSize = number("preview max image size", 2e+7, {}, KNOB_GROUPS.SETTINGS);

    return {...setup, maxImageSize};
};

export const Simple = (): React$Element<typeof Uploady> => {
    const { enhancer, destination, multiple, grouped, groupSize, maxImageSize } = usePreviewStorySetup();

    return <Uploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}
        grouped={grouped}
        maxGroupSize={groupSize}>

        <StyledUploadButton/>
        <br/><br/>
        <UploadPreview
            maxPreviewImageSize={maxImageSize}
            previewComponentProps={{"data-test": "upload-preview"}}
            fallbackUrl="https://picsum.photos/50"/>
    </Uploady>;
};

const PreviewImage = styled.img`
    margin: 5px;
    max-width: 200px;
    height: auto;

    ${({ completed }: { completed: number }) => `opacity: ${completed / 100};`}
`;

const CustomImagePreview = ({ id, url }: { id: string, url: string }) => {
    const { completed } = useItemProgressListener(id) || { completed: 0};
    return <PreviewImage src={url} completed={completed} className="preview-img"/>;
};

export const WithProgress = (): Node => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    const getPreviewProps = useCallback((item: BatchItem) => ({ id: item.id, }), []);

    return <Uploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}
        grouped={grouped}
        maxGroupSize={groupSize}>

        <StyledUploadButton>
            Upload with Progress
        </StyledUploadButton>

        <UploadPreview
            fallbackUrl={"https://picsum.photos/50"}
            previewComponentProps={getPreviewProps}
            PreviewComponent={CustomImagePreview}/>
    </Uploady>;
};

export const WithCustomProps = (): Node => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    const getPreviewProps = useCallback((item: BatchItem, url: string, type: string) => {
        return {
            alt: `${type} - ${url}`,
            "data-id": item.id,
        }
    }, []);

    return (
        <Uploady
            debug
            multiple={multiple}
            destination={destination}
            enhancer={enhancer}
            grouped={grouped}
            maxGroupSize={groupSize}
        >

            <StyledUploadButton>
                Upload
            </StyledUploadButton>

            <UploadPreview
                fallbackUrl={"https://picsum.photos/50"}
                previewComponentProps={getPreviewProps}/>
        </Uploady>
    );
};

const StyledUploadUrlInput = styled(UploadUrlInput)`
  ${uploadUrlInputCss}
`;

const Button = styled.button`
  ${uploadButtonCss}
`;

export const WithUrls = (): Node => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();
    const uploadRef = useRef<?() => void>(null);

    const onButtonClick = () => {
        uploadRef.current?.();
	};

    return (
        <Uploady
            debug
            multiple={multiple}
            destination={destination}
            enhancer={enhancer}
            grouped={grouped}
            maxGroupSize={groupSize}
        >
            <StyledUploadUrlInput uploadRef={uploadRef}/>

            <Button onClick={onButtonClick}>Upload</Button>

            <UploadPreview
                fallbackUrl={"https://picsum.photos/50"}
            />
        </Uploady>
    );
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

export const WithRememberPrevious = (): Node => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    return (<Uploady
            debug
            multiple={multiple}
            destination={destination}
            enhancer={enhancer}
            grouped={grouped}
            maxGroupSize={groupSize}
        >
            <StyledUploadButton>
                Upload
            </StyledUploadButton>

            <PreviewContainer>
                <UploadPreview
                    rememberPreviousBatches
                    fallbackUrl={"https://picsum.photos/50"}/>
            </PreviewContainer>
        </Uploady>
    );
};

/**
 * separating into component so previews change dont cause
 * Uploady to re-render
 */
const PreviewsWithClear = ({ PreviewComp = UploadPreview }: { PreviewComp?: React$ComponentType<PreviewProps> }) => {
	const previewMethodsRef = useRef<?PreviewMethods>(null);
	const [previews, setPreviews] = useState<PreviewItem[]>([]);

	const onPreviewsChanged = useCallback((previews: PreviewItem[]) => {
		setPreviews(previews);
	}, []);

	const onClear = useCallback(() => {
		if (previewMethodsRef.current?.clear) {
			previewMethodsRef.current.clear();
		}
	}, [previewMethodsRef]);

	const getPreviewProps = useCallback((item: BatchItem, url: string, type: string) => {
		return {
			alt: `${type} - ${url}`,
			"data-test": "upload-preview",
		}
	}, []);

	return <>
		<button id="clear-btn" onClick={onClear}>Clear {previews.length} previews</button>
		<br/>
		<PreviewContainer>
			<PreviewComp
				rememberPreviousBatches
				previewComponentProps={getPreviewProps}
				previewMethodsRef={previewMethodsRef}
				onPreviewsChanged={onPreviewsChanged}
				fallbackUrl="https://picsum.photos/50"
            />
		</PreviewContainer>
	</>;
};

export const WithPreviewMethods = (): Node => {
	const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

	return <Uploady
		debug
		multiple={multiple}
		destination={destination}
		enhancer={enhancer}
		grouped={grouped}
		maxGroupSize={groupSize}>
		<StyledUploadButton id="upload-btn">
			Upload
		</StyledUploadButton>

		<PreviewsWithClear/>
	</Uploady>;
};

const ButtonsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
`;

type PreviewButtonsProps = {
    finished: boolean,
    crop: ?Object,
    updateRequest: ?(boolean | Object) => void,
    onUploadCancel: (e: SyntheticEvent<HTMLButtonElement>) => void,
    onUploadCrop: () => Promise<any>,
};

const PreviewButtons = (props: PreviewButtonsProps) => {
	const { finished, crop, updateRequest, onUploadCancel, onUploadCrop } = props;

	return <ButtonsWrapper>
		<button id="crop-btn" className="preview-crop-btn" style={{ display: !finished && updateRequest && crop ? "block" : "none" }}
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

const ItemPreviewWithCrop = withRequestPreSendUpdate((props) => {
	const { id, url, isFallback, type, updateRequest, requestData, previewMethods } = props;
	const [finished, setFinished] = useState<boolean>(false);
	const [crop, setCrop] = useState<CropData>({ unit: "px", height: 100, width: 100, x: 50, y: 50 });
    const imgRef = useRef<?HTMLImageElement>(null);

	useItemFinalizeListener(() =>{
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

const ResumeUpload = () => {
    const { processPending } = useUploady();

    return <button id="resume" onClick={() => processPending()}>resume</button>
}

export const WithCrop = (): Node => {
	const { enhancer, destination, grouped, groupSize, extOptions } = useStoryUploadySetup();
	const previewMethodsRef = useRef<?PreviewMethods>(null);

	return <Uploady
		debug
        autoUpload={extOptions?.autoUpload ?? true}
		multiple={false}
		destination={destination}
		enhancer={enhancer}
		grouped={grouped}
		maxGroupSize={groupSize}
    >

		<StyledUploadButton id="upload-btn">
			Upload
		</StyledUploadButton>
        {extOptions?.autoUpload === false && <ResumeUpload/>}
		<UploadPreview
			PreviewComponent={ItemPreviewWithCrop}
			previewComponentProps={{ previewMethods: previewMethodsRef }}
			previewMethodsRef={previewMethodsRef}
			fallbackUrl="https://picsum.photos/50"
		/>
	</Uploady>;
};

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
        bottom: 20px;
        background-color: rgba(34, 34, 34, 0.6);
    }

    cursor: default;
`;

const ItemPreviewImgWrapper = styled.div`
    margin-right: 10px;
    position: relative;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    ${({ $isCropped }: { $isCropped : boolean }) => $isCropped ? dotCss : ""}

    ${({ $isFinished }: { $isFinished : boolean }) => $isFinished ? finishedCss : ""}
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

const RemovePreviewButton = ({ id, removePreview }: { id: string, removePreview: () => void }) => {
    const abortItem = useAbortItem();

    const onRemove = () => {
        abortItem(id);
        removePreview();
    }

    return (
        <button
            className={`remove-preview-${id.replace(".", "_")}`}
            onClick={onRemove}
        >
            Remove
        </button>
    );
};

type ItemPreviewThumbProps = {
    id: string,
    url: string,
    onPreviewSelected: StateSetter<BatchCropSelected>,
    isCroppedSet: boolean ,
    isFinished: boolean ,
    removePreview:  () =>  void,
};

const ItemPreviewThumb = ({ id, url, onPreviewSelected, isCroppedSet, isFinished, removePreview }: ItemPreviewThumbProps) => {
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
        <br/>
        <RemovePreviewButton id={id} removePreview={removePreview}/>
    </ItemPreviewImgWrapper>
};

const CropperContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

type CropPreviewFieldCompProps = {
    item: BatchItem,
    name: string,
    url: string,
    setCropForItem: (string, Blob) => void,
    ...
};

type BatchCropSelected =  ?{ url: ?string, id: ?string };

type CropperMultiCropProps = {
    item: BatchItem,
    url?: ?string,
    setCropForItem: (string, ?Blob) => void,
    removePreview: ?RemovePreviewMethod,
    onPreviewSelected: StateSetter<BatchCropSelected>,
    ...
};

const CropperForMultiCrop = ({ item, url, setCropForItem, removePreview, onPreviewSelected } : CropperMultiCropProps) => {
    const abortItem = useAbortItem();
    const [crop, setCrop] = useState<CropData>({ unit: "px", height: 100, width: 100, x: 50, y: 50 });
    const imgRef = useRef<?HTMLImageElement>(null);

    const onSaveCrop = async () => {
        const { blob } = await cropImage(imgRef.current, item.file, crop);
        setCropForItem(item.id, blob);
    };

    const onUnsetCrop = () => {
        setCropForItem(item.id, null);
    };

    const onRemoveSelected = () => {
        abortItem(item.id);
        removePreview?.(item.id);
        onPreviewSelected(null);
    };

    return (<CropperContainer>
        <ReactCropWithImage
            src={url}
            crop={crop}
            ref={imgRef}
            onCrop={setCrop}
        />
        <Button onClick={onSaveCrop} id="save-crop-btn">Save Crop</Button>
        <Button onClick={onUnsetCrop} id="unset-crop-btn">Dont use Crop</Button>
        <Button onClick={onRemoveSelected} id="remove-selected-btn">Remove Selected</Button>
    </CropperContainer>);
};

const BatchCrop = withBatchStartUpdate((props) => {
    const { id, updateRequest, requestData, uploadInProgress } = props;
    const previewMethodsRef = useRef<?PreviewMethods>(null);
    const [selected, setSelected] = useState<?{url: ?string, id: ?string }>({ url: null, id: null });
    const [finishedItems, setFinishedItems] = useState<string[]>([]);
    const [cropped, setCropped] = useState<Object>({});
    const hasData = !!(id && requestData);
    const selectedItem = !!selected && requestData?.items.find(({ id }) => id === selected.id);

    const setCropForItem = (id: string, data: ?Blob) => {
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
        setFinishedItems((finished: string[]) => finished.concat(id))
    });

    const getPreviewCompProps = useCallback((item: BatchItem) => {
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
                fallbackUrl="https://picsum.photos/50"
                previewComponentProps={getPreviewCompProps}
                previewMethodsRef={previewMethodsRef}
            />
        </PreviewsContainer>
        {selectedItem && hasData && !uploadInProgress &&
        <CropperForMultiCrop
            {...selected}
            item={selectedItem}
            setCropForItem={setCropForItem}
            removePreview={previewMethodsRef.current?.removePreview}
            onPreviewSelected={setSelected}
        />}
    </MultiCropContainer>);
});

const MultiCropQueue = ({ extOptions }: { extOptions: ?{ autoUpload: boolean } }) => {
    const [currentBatch, setCurrentBatch] = useState<?string>(null);
    const [inProgress, setInProgress] = useState<boolean>(false);

    useBatchAddListener((batch) => setCurrentBatch(batch.id));

    useBatchFinalizeListener(() =>{
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

            {extOptions?.autoUpload === false && !inProgress && <ResumeUpload/>}

            <BatchCrop
                id={currentBatch}
                uploadInProgress={inProgress}
            />
        </div>
    );
};

export const WithMultiCrop = (): Node => {
    const { enhancer, destination, extOptions } = useStoryUploadySetup();

    return <Uploady
        debug
        autoUpload={extOptions?.autoUpload ?? true}
        destination={destination}
        enhancer={enhancer}
    >
        <MultiCropQueue extOptions={extOptions} />
    </Uploady>;
};

const BatchAddUploadPreview = getUploadPreviewForBatchItemsMethod(useBatchAddListener);

const UploadPendingButton = () => {
    const { processPending } = useUploady();

    return <Button onClick={processPending} id="upload-pending-btn">Upload</Button>;
};

export const WithDifferentBatchItemsMethod = (): Node => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    return (
        <Uploady
            debug
            multiple={multiple}
            destination={destination}
            enhancer={enhancer}
            grouped={grouped}
            maxGroupSize={groupSize}
            autoUpload={false}
        >
            <StyledUploadButton id="upload-btn">
                Select Files
            </StyledUploadButton>

            <PreviewsWithClear PreviewComp={BatchAddUploadPreview}/>

            <UploadPendingButton/>
        </Uploady>
    );
};

const TYPES = [
    "IMAGES",
    "DOCUMENTS"
];

const TwoFieldsPreviewContainer = styled.div`
    img {
        max-height: 100px;
        margin-right: 4px;
    }
`;

const UploadFieldWrapper = styled.div`
    margin-bottom: 10px;
    display: flex;
    border-bottom: 1px dashed #646464;

    ${TwoFieldsPreviewContainer} {
        margin-left: 20px;
    }
`;

type UploadFieldProps = {
    type: string,
    Preview: React$ComponentType<PreviewProps>,
    params: Object,
    index: number,
};

const UploadField = ({ type, Preview, params, index }: UploadFieldProps) => {
    return <UploadFieldWrapper className={`upload-field-${index}`}>
        <UploadButton
            className="upload-button"
            params={{ ...params, uploadType: type }}>Upload {type}</UploadButton>

        <TwoFieldsPreviewContainer>
        <h3>Previews for {type}</h3>
        <Preview
            rememberPreviousBatches
        />
        </TwoFieldsPreviewContainer>
    </UploadFieldWrapper>
};

type TypedUploadFieldProps = { params: Object, index: number };

const createUploadFieldForType = (type: string): React$ComponentType<TypedUploadFieldProps> => {
    const useTypedBatchMethod = (cb: (Batch, UploaderCreateOptions) => void) => {
        useBatchStartListener((batch, options) =>{
            if (options.params?.uploadType === type) {
                cb(batch, options);
            }
        });
    };

    const TypedUploadPreview = getUploadPreviewForBatchItemsMethod(useTypedBatchMethod);

    const TypedUploadField = (props: TypedUploadFieldProps) =>
        <UploadField {...props} type={type} Preview={TypedUploadPreview}/>;

    return TypedUploadField;
};

const UploadFields:  React$ComponentType<TypedUploadFieldProps>[] = TYPES.map(createUploadFieldForType);

export const WithTwoFields = (): Node  => {
    const { enhancer, destination, grouped, groupSize } = useStoryUploadySetup();

    return (
        <Uploady
            debug
            destination={destination}
            enhancer={enhancer}
            grouped={grouped}
            maxGroupSize={groupSize}
        >
            <div className="App">
                <h3>Two Upload Fields with single Uploady</h3>

                {TYPES.map((type, index) => {
                    const Field = UploadFields[index];
                    return <Field key={type} index={index} params={{}}/>
                })}
            </div>
        </Uploady>
    );
};

const CropItemPreviewContainer = styled.div`
    display: flex;
    flex-direction: column;

    .preview-thumb {
        max-width: 200px;
        max-height: 200px;
        cursor: pointer;
        margin-bottom: 20px;
    }
`;

const CropPreviewFieldComp = ({  item, name, url, setCropForItem }: CropPreviewFieldCompProps) => {
    const [crop, setCrop] = useState<CropData>({ unit: "px", height: 100, width: 100, x: 50, y: 50 });
    const [croppedUrl, setCroppedUrl] = useState<?{ blobUrl: string, revokeUrl: () => void }>(null);
    const [isCropping, setCropping] = useState<boolean>(false);
    const imgRef = useRef<?HTMLImageElement>(null);

    const startCropping = () => setCropping(true);

    const onSaveCrop = async () => {
        croppedUrl?.revokeUrl();
        const { blob, blobUrl, revokeUrl } = await cropImage(imgRef.current, item.file, crop, true);
        setCropForItem(item.id, blob);
        setCroppedUrl({ blobUrl, revokeUrl });
        setCropping(false);
    };

    useEffect(() => () => { !isCropping && croppedUrl?.revokeUrl(); }, [isCropping, croppedUrl]);

    return <CropItemPreviewContainer>
        {!isCropping ?
            <>
                <span>{name}</span>
                <img className="preview-thumb" src={croppedUrl?.blobUrl || url} onClick={startCropping}/>
            </> :
            <>
                <ReactCropWithImage
                    src={url}
                    crop={crop}
                    onCrop={setCrop}
                    style={{ height: "100%" }}
                    ref={imgRef}
                />
                <Button
                    type="button"
                    onClick={onSaveCrop}
                    id="save-crop-btn">
                    Save Crop
                </Button>
            </>
        }
    </CropItemPreviewContainer>;
};

type UploadCropFieldProps = {
    setCropForItem: (string, Blob) => void,
};

const UploadCropField = ({ setCropForItem }: UploadCropFieldProps) => {
    const getPreviewCompProps = useCallback((item: BatchItem) => {
        return ({
            item,
            setCropForItem,
        });
    }, [setCropForItem]);

    return (<div>
        <StyledUploadButton id="upload-button" extraProps={{ type: "button" }}>Choose image</StyledUploadButton>
        <BatchAddUploadPreview
            previewComponentProps={getPreviewCompProps}
            PreviewComponent={CropPreviewFieldComp}
        />
    </div>);
};

const SubmitButton = styled.button`
    ${uploadButtonCss}
`;

const MyForm = () => {
    const { processPending } = useUploady();
    const [fields, setFields] = useState({});
    const [cropped, setCropped] = useState<?{id: string, data: Object}>(null);

    const setCropForItem = (id: string, data: Blob) => {
        setCropped(() => ({ id, data }));
    };

    useRequestPreSend(({ items }) => {
        // $FlowExpectedError[incompatible-call]
        return {
            items: [{
                ...items[0],
                file: cropped?.data || items[0].file,
            }]
        };
    });

    const onSubmit = () => processPending({ params: fields });

    const onFieldChange = (e: SyntheticEvent<HTMLInputElement>) => {
        setFields({
            ...fields,
            [e.currentTarget.id]: e.currentTarget.value
        });
    };

    return (<form>
        <UploadCropField
            setCropForItem={setCropForItem}
        />
        <input
            onChange={onFieldChange}
            id="field-name"
            type="text"
            placeholder="your name"
        />
        <br/>
        <input
            onChange={onFieldChange}
            id="field-age"
            type="number"
            placeholder="your age"
        />
        <br/>
        <SubmitButton
            onClick={onSubmit}
            id="submit-button"
            type="button"
            disabled={!cropped || undefined}>
            Submit
        </SubmitButton>
    </form>);
};

export const WithCropInForm = (): Node => {
    const { enhancer, destination } = useStoryUploadySetup();

    return (
        <Uploady
            debug
            clearPendingOnAdd
            multiple={false}
            autoUpload={false}
            destination={destination}
            enhancer={enhancer}
        >
            <div className="App">
                <h3>Crop Inside Form</h3>
                <MyForm />
            </div>
        </Uploady>
    );
};

const previewStories: CsfExport = getCsfExport(UploadPreview, "Upload Preview", readme, { pkg: "upload-preview", section: "UI" });

export default { ...previewStories, title: "UI/Upload Preview" }
