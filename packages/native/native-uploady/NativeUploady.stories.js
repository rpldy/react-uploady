// @flow
import React, { useCallback, useContext, useRef } from "react";
import { useStoryUploadySetup, getCsfExport, type CsfExport } from "../../../story-helpers";
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

    return <div>
        <input type="file" ref={inputRef} style={{ display: "none" }} onChange={onInputChange}/>
        <button id="upload-button" onClick={onClick}>Upload</button>
    </div>;
};

export const Simple = (): Node => {
    const { enhancer, destination, grouped, groupSize } = useStoryUploadySetup();

    return <NativeUploady
        debug
        destination={destination}
        enhancer={enhancer}
        grouped={grouped}
        maxGroupSize={groupSize}>
        <WithCustomUI/>
    </NativeUploady>
};

export default (getCsfExport(NativeUploady, "Native Uploady", readme, { pkg: "native-uploady", section: "React-Native" }): CsfExport);
