// @flow
import React, { useCallback, useEffect, useRef, useState } from "react";
import { withKnobs } from "@storybook/addon-knobs";
import Uploady from "@rpldy/uploady";
import {
    useStoryUploadySetup,
    StoryUploadProgress,
} from "../../../story-helpers";
import UploadUrlInput from "./src";

export const Simple = () => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    return <Uploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}
        grouped={grouped}
        maxGroupSize={groupSize}>

        <UploadUrlInput placeholder="URL to upload" />
    </Uploady>;
};

export const WithRef = () => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    const inputRef = useRef();

    const onInputChange = useCallback(() => {
        console.log("INPUT = ", inputRef.current?.value);
    }, []);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.addEventListener("input", onInputChange);
        }

        return () => {
            if (inputRef.current) {
                inputRef.current.removeEventListener("input", onInputChange);
            }
        };
    });

    return <Uploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}
        grouped={grouped}
        maxGroupSize={groupSize}>

        <UploadUrlInput placeholder="URL to upload" ref={inputRef}/>
    </Uploady>;
};

export const WithButtonAndValidate = () => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();
    const [error, setError] = useState(null);
    const uploadRef = useRef(null);

    return <Uploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}
        grouped={grouped}
        maxGroupSize={groupSize}>

        <UploadUrlInput
            uploadRef={uploadRef}
            validate={(value) => {
                const valid = !!(value && !value.indexOf("http"));
                setError(valid ? null : "URL must be valid http address");
                return valid;
            }}
            placeholder="URL to upload"/>
        {error && <span style={{ color: "red" }}>{error}</span>}
        <br/>
        <button onClick={() => {
            if (uploadRef && uploadRef.current) {
                uploadRef.current();
            }
        }}>Upload
        </button>
        <br/>
        <StoryUploadProgress/>
    </Uploady>;
};

export default {
    component: UploadUrlInput,
    title: "Upload Url Input",
    decorators: [withKnobs],
};

