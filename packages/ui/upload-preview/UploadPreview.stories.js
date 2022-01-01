// @flow
import React, { useCallback, useState, useRef } from "react";
import styled,  { css } from "styled-components";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { number } from "@storybook/addon-knobs";
import Uploady, {
    useItemProgressListener,
    useItemFinalizeListener,
    withRequestPreSendUpdate,
    withBatchStartUpdate,
    useBatchAddListener,
    useBatchFinalizeListener,
    useBatchProgressListener,
    useUploady,
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
    type CsfExport,
} from "../../../story-helpers";
import UploadPreview, {
    getUploadPreviewForBatchItemsMethod,
    PREVIEW_TYPES
} from "./src";

// $FlowIssue - doesnt understand loading readme
import readme from "./README.md";
import type { Node } from "React";

const StyledUploadButton = styled(UploadButton)`
	${uploadButtonCss}
`;

const usePreviewStorySetup = () => {
    const setup = useStoryUploadySetup();
    const maxImageSize = number("preview max image size", 2e+7, {}, KNOB_GROUPS.SETTINGS);

    return {...setup, maxImageSize};
};

export const Simple = (): Node => {
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
            fallbackUrl="https://icon-library.net/images/image-placeholder-icon/image-placeholder-icon-6.jpg"/>
    </Uploady>;
};

const PreviewImage = styled.img`
    margin: 5px;
    max-width: 200px;
    height: auto;

    ${({ completed }) => `opacity: ${completed / 100};`}
`;

const CustomImagePreview = ({ id, url }) => {
    const { completed } = useItemProgressListener(id) || { completed: 0};
    return <PreviewImage src={url} completed={completed} className="preview-img"/>;
};

export const WithProgress = (): Node => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    const getPreviewProps = useCallback((item) => ({ id: item.id, }), []);

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
            fallbackUrl={"https://icon-library.net/images/image-placeholder-icon/image-placeholder-icon-6.jpg"}
            previewComponentProps={getPreviewProps}
            PreviewComponent={CustomImagePreview}/>
    </Uploady>;
};

export const WithCustomProps = (): Node => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    const getPreviewProps = useCallback((item, url, type) => {
        return {
            alt: `${type} - ${url}`,
            "data-id": item.id,
        }
    }, []);

    return <Uploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}
        grouped={grouped}
        maxGroupSize={groupSize}>

        <StyledUploadButton>
            Upload
        </StyledUploadButton>

        <UploadPreview
            fallbackUrl={"https://icon-library.net/images/image-placeholder-icon/image-placeholder-icon-6.jpg"}
            previewComponentProps={getPreviewProps}/>
    </Uploady>;
};

const StyledUploadUrlInput = styled(UploadUrlInput)`
  ${uploadUrlInputCss}
`;

const Button = styled.button`
  ${uploadButtonCss}
`;

export const WithUrls = (): Node => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();
    const uploadRef = useRef(null);

    const onButtonClick = () => {
		if (uploadRef.current) {
			uploadRef.current();
		}
	};

    return <Uploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}
        grouped={grouped}
        maxGroupSize={groupSize}>

        <StyledUploadUrlInput uploadRef={uploadRef}/>

        <Button onClick={onButtonClick}>Upload</Button>

        <UploadPreview
                fallbackUrl={"https://icon-library.net/images/image-placeholder-icon/image-placeholder-icon-6.jpg"}/>
    </Uploady>;
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

	return <Uploady
		debug
		multiple={multiple}
		destination={destination}
		enhancer={enhancer}
		grouped={grouped}
		maxGroupSize={groupSize}>

		<StyledUploadButton>
			Upload
		</StyledUploadButton>

		<PreviewContainer>
			<UploadPreview
				rememberPreviousBatches
				fallbackUrl={"https://icon-library.net/images/image-placeholder-icon/image-placeholder-icon-6.jpg"}/>
		</PreviewContainer>
	</Uploady>;
};

/**
 * separating into component so previews change dont cause
 * Uploady to re-render
 */
const PreviewsWithClear = ({PreviewComp = UploadPreview}) => {
	const previewMethodsRef = useRef();
	const [previews, setPreviews] = useState([]);

	const onPreviewsChanged = useCallback((previews) => {
		setPreviews(previews);
	}, []);

	const onClear = useCallback(() => {
		if (previewMethodsRef.current?.clear) {
			previewMethodsRef.current.clear();
		}
	}, [previewMethodsRef]);

	const getPreviewProps = useCallback((item, url, type) => {
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
				fallbackUrl="https://icon-library.net/images/image-placeholder-icon/image-placeholder-icon-6.jpg"
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

const StyledReactCrop = styled(ReactCrop)`
  width: 100%;
  max-width: 900px;
  max-height: 400px;
`;

const ButtonsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
`;

const PreviewButtons = (props) => {
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
	const [finished, setFinished] = useState(false);
	const [crop, setCrop] = useState({ height: 100, width: 100, x: 50, y: 50 });

	useItemFinalizeListener(() =>{
		setFinished(true);
	}, id);

	const onUploadCrop = useCallback(async() => {
		if (updateRequest && (crop?.height || crop?.width)) {
			requestData.items[0].file = await cropImage(url, requestData.items[0].file, crop);
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
			{requestData ? <StyledReactCrop
				src={url}
				crop={crop}
				onChange={setCrop}
				onComplete={setCrop}
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

export const WithCrop = (): Node => {
	const { enhancer, destination, grouped, groupSize } = useStoryUploadySetup();
	const previewMethodsRef = useRef();

	return <Uploady
		debug
		multiple={false}
		destination={destination}
		enhancer={enhancer}
		grouped={grouped}
		maxGroupSize={groupSize}>

		<StyledUploadButton id="upload-btn">
			Upload
		</StyledUploadButton>

		<UploadPreview
			PreviewComponent={ItemPreviewWithCrop}
			previewComponentProps={{ previewMethods: previewMethodsRef }}
			previewMethodsRef={previewMethodsRef}
			fallbackUrl="https://icon-library.net/images/image-placeholder-icon/image-placeholder-icon-6.jpg"
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

const CropperContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

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

const MultiCropQueue = () => {
    const [currentBatch, setCurrentBatch] = useState(null);
    const [inProgress, setInProgress] = useState(false);

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

            <BatchCrop
                id={currentBatch}
                uploadInProgress={inProgress}
            />
        </div>
    );
};

export const WithMultiCrop = (): Node => {
    const { enhancer, destination } = useStoryUploadySetup();

    return <Uploady
        debug
        destination={destination}
        enhancer={enhancer}
    >
        <MultiCropQueue  />
    </Uploady>;
};

const CustomUploadPreview = getUploadPreviewForBatchItemsMethod(useBatchAddListener);

const UploadPendingButton = () => {
    const { processPending } = useUploady();

    return <Button onClick={processPending} id="upload-pending-btn">Upload</Button>;
};

export const WithDifferentBatchItemsMethod = (): Node => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    return <Uploady
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

        <PreviewsWithClear PreviewComp={CustomUploadPreview}/>

        <UploadPendingButton/>
    </Uploady>;
};

export default (getCsfExport(UploadPreview, "Upload Preview", readme): CsfExport);
