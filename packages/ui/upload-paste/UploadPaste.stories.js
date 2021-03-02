// @flow
import React, {
    // Component,
    // useMemo,
    // useState,
    // useRef,
    // useCallback,
    // forwardRef,
} from "react";
import styled from "styled-components";
import Uploady from "@rpldy/uploady";
import {
    useStoryUploadySetup,
    StoryUploadProgress,
    // uploadButtonCss,
    // mockDestination,
    // useEventsLogUpdater,
    getCsfExport,
    type CsfExport,
} from "../../../story-helpers";
import withPaste from "./src";

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



    return <Uploady debug
                    multiple={multiple}
                    destination={destination}
                    enhancer={enhancer}
                    grouped={grouped}
                    maxGroupSize={groupSize}
                    fileInputId={"rpldyInput"}>

        <PasteArea >
            Click here & Paste a file
        </PasteArea>
        <StoryUploadProgress/>
    </Uploady>;
};

export default (getCsfExport(undefined, "Upload Paste",readme): CsfExport);
