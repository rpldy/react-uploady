// @flow
import React, { useCallback, useState, useRef } from "react";
import styled from "styled-components";
import { withKnobs } from "@storybook/addon-knobs";
import Uploady, {
    useItemProgressListener,
} from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";
import UploadUrlInput from "@rpldy/upload-url-input";
import UploadPreview from "./src";

import {
    useStoryUploadySetup,
    uploadButtonCss,
    uploadUrlInputCss,
} from "../../../story-helpers";

const StyledUploadButton = styled(UploadButton)`
	${uploadButtonCss}
`;

export const Simple = () => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

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
            fallbackUrl={"https://icon-library.net/images/image-placeholder-icon/image-placeholder-icon-6.jpg"}/>
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

export default {
    component: UploadPreview,
    title: "Upload Preview",
    decorators: [withKnobs],
};
