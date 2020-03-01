// @flow
import React, { useMemo, useState } from "react";
import styled from "styled-components";
import Uploady, {
    useItemProgressListener,
    useBatchAddListener,
    useBatchStartListener,
    useBatchFinishListener,
} from "@rpldy/uploady";
import UploadButton from "@rpldy/upload-button";
import UploadUrlInput from "@rpldy/upload-url-input";
import UploadPreview from "./src";

import {
    useStoryUploadySetup,
    withKnobs,
    uploadButtonCss,
    uploadUrlInputCss,
} from "../../../story-helpers";

export const Simple = () => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    return <Uploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}
        grouped={grouped}
        maxGroupSize={groupSize}>

        <UploadButton/>
        <br/><br/>
        <UploadPreview
            fallbackUrl={"https://icon-library.net/images/image-placeholder-icon/image-placeholder-icon-6.jpg"}/>
    </Uploady>;
};

const PreviewContainer = styled.div`
	display: flex;
	flex-wrap: wrap;

	img {
		margin-left: 10px;
		max-width: 200px;
		height: auto;

		${({ completed }) => `opacity: ${completed / 100};`}
	}
`;

const StyledUploadButton = styled(UploadButton)`
	${uploadButtonCss}
`;

const StyledUploadUrlInput = styled(UploadUrlInput)`
  ${uploadUrlInputCss}
`;

// const UrlUpload = () => {
// 	const uploadRef = useRef(null);
//
// 	const onButtonClick = () => {
// 		if (uploadRef.current) {
// 			uploadRef.current();
// 		}
// 	};
//
// 	return <>
// 		<StyledUploadUrlInput
// 			placeholder="enter valid url to upload"
// 			uploadRef={uploadRef}/>
//
// 		<Button onClick={onButtonClick}>Upload</Button>
// 	</>;
// };


// export const WithUrls = () => {
//     const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();
//
//     return <Uploady
//         debug
//         multiple={multiple}
//         destination={destination}
//         enhancer={enhancer}
//         grouped={grouped}
//         maxGroupSize={groupSize}>
//
//         <StyledUploadUrlInput/>
//
//         <PreviewContainer>
//             <UploadPreview
//                 fallbackUrl={"https://icon-library.net/images/image-placeholder-icon/image-placeholder-icon-6.jpg"}/>
//         </PreviewContainer>
//     </Uploady>;
// };

//TODO: This example only works for single file upload (not multiple and not concurrent)
const PreviewWithProgress = () => {
    const [currentBatch, setCurrentBatch] = useState(null);
    const fileProgress = useItemProgressListener();

    useBatchAddListener((batch) => {
        setCurrentBatch(batch.id);
    });

    const completed = useMemo(() => {
            return (!currentBatch ||
                fileProgress?.batchId === currentBatch &&
                fileProgress?.completed) || 0;
        },
        [currentBatch, fileProgress]);

    return <PreviewContainer completed={completed}>
        <UploadPreview
            fallbackUrl={"https://icon-library.net/images/image-placeholder-icon/image-placeholder-icon-6.jpg"}/>
    </PreviewContainer>;
};

export const WithProgress = () => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

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

        <PreviewWithProgress/>
    </Uploady>;
};

export default {
    component: UploadPreview,
    title: "Upload Preview",
    decorators: [withKnobs],
};
