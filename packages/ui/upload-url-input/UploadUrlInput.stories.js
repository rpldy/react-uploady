// @flow
import React, { useCallback, useEffect, useRef, useState } from "react";
import Uploady from "@rpldy/uploady";
import {
    useStoryUploadySetup,
    StoryUploadProgress,
    getCsfExport,
    type CsfExport,
} from "../../../story-helpers";
import UploadUrlInput from "./src";

// $FlowFixMe - doesnt understand loading readme
import readme from "./README.md";

import type { Node } from "React";

export const Simple = (): Node => {
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

export const WithRef = (): Node => {
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

export const WithButtonAndValidate = (): Node => {
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

export default (getCsfExport<typeof UploadUrlInput>(UploadUrlInput, "Upload Url Input", readme): CsfExport<typeof UploadUrlInput>);
