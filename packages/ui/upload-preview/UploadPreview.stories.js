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
    useBatchStartListener,
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

// $FlowFixMe - doesnt understand loading readme
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

const CustomImagePreview = (props) => {
    const [completed, setCompleted] = useState(0);

    useItemProgressListener((item) => {
        if (item.id === props.id){
            setCompleted(item.completed);
        }
    });

    return <PreviewImage src={props.url} completed={completed}/>;
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

const BatchStartUploadPreview = getUploadPreviewForBatchItemsMethod(useBatchStartListener);

const MultiCropContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const dotCss = css`
    &:after {
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

const ItemPreviewImgWrapper = styled.div`
    margin-right: 10px;
    position: relative;

    ${({$isCropped}) => $isCropped ? dotCss : ""}
`;

const ItemPreviewImg = styled.img`
    max-height: 160px;
    max-width: 160px;
    cursor: pointer;
    transition: box-shadow 0.5s;

    &:hover {
        box-shadow: 0 0 1px 2px #222222;
    }
`;

const PreviewsContainer = styled.div`
    display: flex;
    margin-bottom: 20px;
`;

const ItemPreviewThumb = ({ url, id, onPreviewSelected, getIsCroppedSet }) => {
    const onPreviewClick = () => {
        onPreviewSelected({id, url});
    };

    return <ItemPreviewImgWrapper $isCropped={getIsCroppedSet(id)}>
        <ItemPreviewImg
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
        <Button onClick={onSaveCrop}>Save Crop</Button>
        <Button onClick={onUnsetCrop}>Dont use Crop</Button>
    </CropperContainer>);
};

const MultiCropQueue = withBatchStartUpdate((props)  => {
    const { id, requestData, updateRequest } = props;
    const [selected, setSelected] = useState(null);
    const [cropped, setCropped] = useState({});

    const getIsCroppedSet = useCallback((id) => !!cropped[id], [cropped]);

    const setCropForItem  = (id, data) => {
        setCropped((cropped) => ({...cropped, [id]: data}));
    };

    return (<MultiCropContainer>
        {requestData && <Button>Upload All</Button>}
        <PreviewsContainer>
            <BatchStartUploadPreview
                PreviewComponent={ItemPreviewThumb}
                fallbackUrl="https://icon-library.net/images/image-placeholder-icon/image-placeholder-icon-6.jpg"
                previewComponentProps={{
                    onPreviewSelected: setSelected,
                    getIsCroppedSet,
                }}
            />
        </PreviewsContainer>
        {selected && requestData &&
        <CropperForMultiCrop
            {...selected}
            item={requestData.items.find(({ id }) => id === selected.id)}
            setCropForItem={setCropForItem}
        />}
    </MultiCropContainer>);
});

export const WithMultiCrop = (): Node => {
    const { enhancer, destination } = useStoryUploadySetup();

    return <Uploady
        concurrent
        maxConcurrent={2}
        debug
        destination={destination}
        enhancer={enhancer}
    >
        <StyledUploadButton id="upload-btn">
            Select Files
        </StyledUploadButton>

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
