// @flow
import React, { useCallback, useContext, useRef } from "react";
import {
    createUploadyStory,
    getCsfExport,
    type CsfExport,
    type UploadyStory
} from "../../../story-helpers";
import NativeUploady, { UploadyContext } from "./src";
import readme from "./README.md";

import type { Node } from "react";

const WithCustomUI = () => {
    const uploadyContext = useContext(UploadyContext);
    const inputRef = useRef<?HTMLInputElement>(null);

    const onClick = useCallback(() => {
        const input = inputRef.current;
        if (input) {
            input.click();
        }
    }, []);

    const onInputChange = useCallback(() => {
        uploadyContext?.upload(inputRef.current?.files);
    }, []);

    return (
        <div>
            <input
                type="file"
                ref={inputRef}
                style={{ display: "none" }}
                onChange={onInputChange}
            />
            <button id="upload-button" onClick={onClick}>
                Upload
            </button>
        </div>
    );
};

export const Simple: UploadyStory = createUploadyStory(
    ({ enhancer, destination, grouped, groupSize }): Node => {
        return (
            <NativeUploady
                debug
                destination={destination}
                enhancer={enhancer}
                grouped={grouped}
                maxGroupSize={groupSize}
            >
                <WithCustomUI/>
            </NativeUploady>
        );
    });

const nativeUploadyStories: CsfExport = getCsfExport(NativeUploady, "Native Uploady", readme, {
    pkg: "native-uploady",
    section: "React-Native"
});

export default { ...nativeUploadyStories, title: "React-Native/Native Uploady" };
