// @flow
import React, { useCallback, useState, useRef } from "react";
import styled from "styled-components";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { withKnobs, number } from "@storybook/addon-knobs";
import Uploady, {
    useItemProgressListener,
	useItemFinalizeListener,
	withRequestPreSendUpdate,
} from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";
import UploadUrlInput from "@rpldy/upload-url-input";
import UploadPreview from "./src";

import {
    KNOB_GROUPS,
    useStoryUploadySetup,
    uploadButtonCss,
    uploadUrlInputCss,
	cropImage
} from "../../../story-helpers";

// $FlowFixMe - doesnt understand loading readme
import readme from "./README.md";

const StyledUploadButton = styled(UploadButton)`
	${uploadButtonCss}
`;

const usePreviewStorySetup = () => {
    const setup = useStoryUploadySetup();
    const maxImageSize = number("preview max image size", 2e+7, {}, KNOB_GROUPS.SETTINGS);

    return {...setup, maxImageSize};
};

export const Simple = () => {
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

export const WithProgress = () => {
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

export const WithCustomProps = () => {
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

const Button  = styled.button`
  ${uploadButtonCss}
`;

export const WithUrls = () => {
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

export const WithRememberPrevious = () => {
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
const PreviewsWithClear = () => {
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
			<UploadPreview
				rememberPreviousBatches
				previewComponentProps={getPreviewProps}
				previewMethodsRef={previewMethodsRef}
				onPreviewsChanged={onPreviewsChanged}
				fallbackUrl="https://icon-library.net/images/image-placeholder-icon/image-placeholder-icon-6.jpg"/>
		</PreviewContainer>
	</>;
};

export const WithPreviewMethods = () => {
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

const ImageCropWrapper = styled.div`
    position: relative;
    width: 100%;
    max-height: 500px;
`;

const ItemPreviewWithCrop = withRequestPreSendUpdate((props) => {
	const { id, url, isFallback, updateRequest, requestData } = props;
	const imgRef = useRef(null);
	const [finished, setFinished] = useState(false);
	const [crop, setCrop] = useState(null);

	useItemFinalizeListener(() =>{
		setFinished(true);
	}, id);

	const onUploadCrop = useCallback(async() => {
		if (updateRequest && (crop?.height || crop?.width)) {
			requestData.items[0].file = await cropImage(url, requestData.items[0].file, crop);;
			updateRequest({ items: requestData.items });
		}
	}, [url, requestData, updateRequest, crop]);

	const onUploadCancel = useCallback(() => {
		updateRequest(false);
	}, [updateRequest]);

	const onLoad = useCallback(img => {
		imgRef.current = img;
	}, []);

	return isFallback ?
		<PreviewContainer>
			<img src={url} alt="fallback img"/>
		</PreviewContainer> :
		<>
			<ImageCropWrapper>
				{requestData ? <ReactCrop
					src={url}
					onImageLoaded={onLoad}
					crop={crop}
					onChange={setCrop}
					onComplete={setCrop}
				/> : null}
			</ImageCropWrapper>
			<button style={{ display: !finished && updateRequest && crop ? "block" : "none" }}
					onClick={onUploadCrop}>
				Upload Cropped
			</button>
			<button style={{ display: !finished && updateRequest && crop ? "block" : "none" }}
					onClick={onUploadCancel}>
				Cancel
			</button>
		</>;
});

export const WithCrop = () => {
	const { enhancer, destination, grouped, groupSize } = useStoryUploadySetup();

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
		/>
	</Uploady>;
};

export default {
    component: UploadPreview,
    title: "Upload Preview",
    decorators: [withKnobs],
    parameters: {
        readme: {
            sidebar: readme,
        },
        options: {
            showPanel: true,
            //needed until storybook-readme fixes their bug - https://github.com/tuchk4/storybook-readme/issues/221
            theme: {}
        },
    },
};
