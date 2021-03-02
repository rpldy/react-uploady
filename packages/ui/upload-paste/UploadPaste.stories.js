// @flow
import React, {
    // Component,
    // useMemo,
    useState,
    useRef,
    useCallback,
} from "react";
import styled from "styled-components";
import Uploady from "@rpldy/uploady";
import {
    useStoryUploadySetup,
    StoryUploadProgress,
    getCsfExport,
    type CsfExport,
} from "../../../story-helpers";
import withPaste, { usePasteUpload } from "./src";

// $FlowFixMe - doesnt understand loading readme
import readme from "./README.md";

import type { Node, Element } from "React"

const SimpleContainer = styled.div`
    top: 200px;
    width: 400px;
    height: 400px;
    border: 1px solid #000;
    display: flex;
    justify-content: center;
    align-items: center;

    &:active {
        background-color: #2b6496;
    }
`;

const PasteArea = withPaste(SimpleContainer)

export const Simple = (): Node => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    const onPasteUpload = useCallback(({ count }) => {
        console.log("PASTE-TO-UPLOAD files: ", count);
    }, []);

    return <Uploady debug
                    multiple={multiple}
                    destination={destination}
                    enhancer={enhancer}
                    grouped={grouped}
                    maxGroupSize={groupSize}
                    fileInputId={"rpldyInput"}>

        <PasteArea onPasteUpload={onPasteUpload}>
            Click here & Paste a file
        </PasteArea>
        <StoryUploadProgress/>
    </Uploady>;
};

const WindowPaste = () => {
    const onPasteUpload = useCallback(({ count }) => {
        console.log("WINDOW PASTE-TO-UPLOAD files: ", count);
    }, []);

    const { toggle, getIsEnabled } = usePasteUpload(null, null, onPasteUpload);

    const [isEnabled, setIsEnabled] = useState(getIsEnabled);

    const onToggleClick = useCallback(() => {
        setIsEnabled(toggle());
    }, [toggle]);

    return <>
        <h2>Paste Handling {isEnabled ? "Enabled" : "Disabled"}</h2>
        <button onClick={onToggleClick}>Toggle Paste Handling</button>
    </>;
};

export const WithWindowPaste = (): Node => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    return <Uploady debug
                    multiple={multiple}
                    destination={destination}
                    enhancer={enhancer}
                    grouped={grouped}
                    maxGroupSize={groupSize}
                    fileInputId={"rpldyInput"}>

        <h1>paste anywhere to initiate upload (registered on window)</h1>
        <WindowPaste/>
        <StoryUploadProgress/>
    </Uploady>;
};

const ElementPaste = () => {

};

export const WithElementPaste = (): Node => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    return <Uploady debug
                    multiple={multiple}
                    destination={destination}
                    enhancer={enhancer}
                    grouped={grouped}
                    maxGroupSize={groupSize}
                    fileInputId={"rpldyInput"}>
        <StoryUploadProgress/>
    </Uploady>;
    };

export default (getCsfExport(undefined, "Upload Paste",readme): CsfExport);
