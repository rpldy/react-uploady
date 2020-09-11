// @flow
import React, { useCallback, useContext, useRef } from "react";
import { useStoryUploadySetup } from "../../../story-helpers";
import NativeUploady, { UploadyContext } from "./src";

// $FlowFixMe - doesnt understand loading readme
import readme from "./README.md";

const WithCustomUI = () => {
    const uploadyContext = useContext(UploadyContext);
    const inputRef = useRef(null);

    const onClick = useCallback(() => {
        const input = inputRef.current;
        if (input) {
            input.click();
        }
    }, []);

    const onInputChange = useCallback(() => {
        uploadyContext.upload(inputRef.current?.files);
    }, []);

    return <div>
        <input type="file" ref={inputRef} style={{ display: "none" }} onChange={onInputChange}/>
        <button id="upload-button" onClick={onClick}>Upload</button>
    </div>;
};

export const Simple = () => {
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

export default {
    component: NativeUploady,
    title: "Native Uploady",
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
