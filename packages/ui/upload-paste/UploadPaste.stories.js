// @flow
import React, { useState, useRef, useCallback } from "react";
import styled from "styled-components";
import Uploady, { useUploady } from "@rpldy/uploady";
import UploadDropZone from "@rpldy/upload-drop-zone";
import { asUploadButton } from "@rpldy/upload-button";
import {
    createUploadyStory,
    StoryUploadProgress,
    dropZoneCss,
    getCsfExport,
    type CsfExport,
    type UploadyStory,
} from "../../../story-helpers";
import withPasteUpload, { usePasteUpload } from "./src";
import Readme from "./UploadPaste.storydoc.mdx";

import type { Node } from "react";
import type { UploadOptions } from "@rpldy/shared";
import type { PasteUploadHookResult } from "./src";

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

const PasteArea = withPasteUpload(SimpleContainer);

export const Simple: UploadyStory = createUploadyStory(
    ({ enhancer, destination, multiple, grouped, groupSize }): Node => {
        const onPasteUpload = useCallback(({ count }: { count: number }) => {
            console.log("PASTE-TO-UPLOAD files: ", count);
        }, []);

        return (
            <Uploady
                debug
                multiple={multiple}
                destination={destination}
                enhancer={enhancer}
                grouped={grouped}
                maxGroupSize={groupSize}
            >
                <PasteArea onPasteUpload={onPasteUpload} id="paste-area">
                    Click here & Paste a file
                </PasteArea>
                <StoryUploadProgress/>
            </Uploady>
        );
    });

const PasteToggle = ({ toggle, getIsEnabled }: PasteUploadHookResult ) => {
    const [isEnabled, setIsEnabled] = useState<boolean>(getIsEnabled);

    const onToggleClick = useCallback(() => {
        setIsEnabled(toggle());
    }, [toggle]);

    return <>
        <h2>Paste Handling {isEnabled ? "Enabled" : "Disabled"}</h2>
        <button onClick={onToggleClick}>Toggle Paste Handling</button>
    </>;
} ;

const WindowPaste = () => {
    const onPasteUpload = useCallback(({ count }:  { count: number }) => {
        console.log("WINDOW PASTE-TO-UPLOAD files: ", count);
    }, []);

    const pasteUpload = usePasteUpload(null, null, onPasteUpload);

    return <PasteToggle {...pasteUpload} />;
};

export const WithWindowPaste: UploadyStory = createUploadyStory(
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
                <h1>paste anywhere to initiate upload (registered on window)</h1>
                <WindowPaste/>
                <StoryUploadProgress/>
            </Uploady>
        );
    });

const ElementPaste = (props: UploadOptions) => {
    const containerRef = useRef<?HTMLElement>(null);

    const onPasteUpload = useCallback(({ count }: { count: number }) => {
        console.log("ELEMENT PASTE-TO-UPLOAD files: ", count);
    }, []);

    const pasteUpload = usePasteUpload(props, containerRef, onPasteUpload);

    return <>
        <SimpleContainer id="element-paste" ref={containerRef}>
            Click here & Paste a file
        </SimpleContainer>
        <PasteToggle {...pasteUpload} />
    </>;
};

const ProcessPending = () => {
    const { processPending } = useUploady();

    return <button id="process-pending"
                   onClick={processPending}>PROCESS PENDING</button>;
};

export const WithElementPaste: UploadyStory = createUploadyStory(
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
                <ElementPaste autoUpload={false} params={{ test: "paste" }}/>
                <br/>
                <ProcessPending/>
                <StoryUploadProgress/>
            </Uploady>
        );
    });

const StyledDropZone = styled(UploadDropZone)`
   ${dropZoneCss}
`;

const PasteUploadDropZone = withPasteUpload(StyledDropZone);

export const WithPasteDropZone: UploadyStory = createUploadyStory(
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
                <PasteUploadDropZone id="upload-drop-zone" params={{ test: "paste" }}>
                    You can drop a file here
                    <br/>
                    OR
                    <br/>
                    click and paste a file to upload
                </PasteUploadDropZone>
            </Uploady>
        );
    });

const StyledDivButton = styled.div`
    width: 300px;
    height: 160px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid navy;
    cursor: pointer;

    &:active {
        background-color: antiquewhite;
    }

    &:focus {
        background-color: #4a9ae1;
    }
`;

const DivUploadButton = asUploadButton(StyledDivButton);

const PasteUploadButton = withPasteUpload(DivUploadButton);

export const WithPasteUploadButton: UploadyStory = createUploadyStory(
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
                <PasteUploadButton
                    id="upload-button"
                    params={{ test: "paste" }}
                    extraProps={{ tabIndex: 1 }}
                >
                    Click to upload
                    <br/>
                    OR
                    <br/>
                    if you're still focused on this div, paste to upload
                </PasteUploadButton>
            </Uploady>
        );
    });

const uploadPasteStories: CsfExport = getCsfExport(undefined, "Upload Paste", Readme, {
    pkg: "upload-paste",
    section: "UI"
});

export default { ...uploadPasteStories, title: "UI/Upload Paste" };
