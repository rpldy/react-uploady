// @flow
import React, { useCallback, useEffect, useRef, useState } from "react";
import Uploady from "@rpldy/uploady";
import {
    createUploadyStory,
    StoryUploadProgress,
    getCsfExport,
    type CsfExport,
    type UploadyStory,
} from "../../../story-helpers";
import UploadUrlInput from "./src";

import Readme from "./UploadUrlInput.storydoc.mdx";
import type { Node } from "react";

export const Simple: UploadyStory = createUploadyStory(
    ({ enhancer, destination, multiple, grouped, groupSize }): Node => {
        return (
            <Uploady
                debug
                multiple={multiple}
                destination={destination}
                enhancer={enhancer}
                grouped={grouped}
                maxGroupSize={groupSize}
            >
                <UploadUrlInput placeholder="URL to upload"/>
            </Uploady>
        );
    });

export const WithRef: UploadyStory = createUploadyStory(
    ({ enhancer, destination, multiple, grouped, groupSize }): Node => {
        const inputRef = useRef<?HTMLInputElement>(null);

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

        return (
            <Uploady
                debug
                multiple={multiple}
                destination={destination}
                enhancer={enhancer}
                grouped={grouped}
                maxGroupSize={groupSize}
            >
                <UploadUrlInput placeholder="URL to upload" ref={inputRef}/>
            </Uploady>
        );
    });

export const WithButtonAndValidate: UploadyStory = createUploadyStory(
    ({ enhancer, destination, multiple, grouped, groupSize }): Node => {
        const [error, setError] = useState<?string | void>(null);
        const uploadRef = useRef<(() => void) | void | null>(null);

        return (
            <Uploady
                debug
                multiple={multiple}
                destination={destination}
                enhancer={enhancer}
                grouped={grouped}
                maxGroupSize={groupSize}
            >
                <UploadUrlInput
                    uploadRef={uploadRef}
                    validate={(value) => {
                        const valid = !!(value && !value.indexOf("http"));
                        setError(valid ? null : "URL must be valid http address");
                        return valid;
                    }}
                    placeholder="URL to upload"
                />
                {error && <span style={{ color: "red" }}>{error}</span>}
                <br/>
                <button
                    onClick={() => {
                        uploadRef.current?.();
                    }}
                >
                    Upload
                </button>
                <br/>
                <StoryUploadProgress/>
            </Uploady>
        );
    });

const UrlInputStories: CsfExport = getCsfExport(UploadUrlInput, "Upload Url Input", Readme, {
    pkg: "upload-url-input",
    section: "UI"
});

export default { ...UrlInputStories, title: "UI/Upload Url Input" };
