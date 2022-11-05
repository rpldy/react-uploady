// @flow
import React, { forwardRef, useCallback, useContext, useMemo, useRef } from "react";
import styled, { css } from "styled-components";
import { number } from "@storybook/addon-knobs";
import { DndProvider, useDrop } from "react-dnd";
import Backend, { NativeTypes } from "react-dnd-html5-backend";
import Uploady, { UploadyContext } from "@rpldy/uploady";
import { asUploadButton } from "@rpldy/upload-button";
import UploadDropZone from "./src";
import {
    useStoryUploadySetup,
    StoryUploadProgress,
    dropZoneCss,
    getCsfExport,
    KNOB_GROUPS,
    type CsfExport,
} from "../../../story-helpers";

// $FlowFixMe - doesnt understand loading readme
import readme from "./README.md";

import type { Node } from "React";

const StyledDropZone = styled(UploadDropZone)`
   ${dropZoneCss}
`;

const SmallDropZone = styled(StyledDropZone)`
  width: 200px;
  height: 200px;
`;

export const Simple = (): Node => {
    const { enhancer, destination, multiple, grouped, groupSize, extOptions } = useStoryUploadySetup();

    return <Uploady debug
                    multiple={multiple}
                    destination={destination}
                    enhancer={enhancer}
                    grouped={grouped}
                    maxGroupSize={groupSize}
                    {...extOptions}
    >
        <StyledDropZone id="upload-drop-zone" onDragOverClassName="drag-over">
            <div id="drag-text">Drag File(s) Here</div>
            <div id="drop-text">Drop File(s) Here</div>
        </StyledDropZone>
    </Uploady>;
};

export const WithProgress = (): Node => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    return <Uploady debug
                    multiple={multiple}
                    destination={destination}
                    enhancer={enhancer}
                    grouped={grouped}
                    maxGroupSize={groupSize}>

        <StyledDropZone onDragOverClassName="drag-over">
            <div id="drag-text">Drag File(s) Here</div>
            <div id="drop-text">Drop File(s) Here</div>

            <StoryUploadProgress/>
        </StyledDropZone>
    </Uploady>;
};

export const WithDropHandler = (): Node => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    const dropHandler = useCallback((e) => {
        console.log(">>>> DROP EVENT ", e.dataTransfer);
        return "https://i.pinimg.com/originals/51/bf/9c/51bf9c7fdf0d4303140c4949afd1d7b8.jpg";
    }, []);

    return <Uploady debug
                    multiple={multiple}
                    destination={destination}
                    enhancer={enhancer}
                    grouped={grouped}
                    maxGroupSize={groupSize}>

        <StyledDropZone id="upload-drop-zone" onDragOverClassName="drag-over" dropHandler={dropHandler}>
            <div id="drag-text">Drag File(s) Here</div>
            <div id="drop-text">Drop Files(s) Here</div>
        </StyledDropZone>
    </Uploady>;
};

export const WithDropHandlerAndGetFiles = (): Node => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();
    const fileCount = number("file count in drop", 1, {}, KNOB_GROUPS.SETTINGS);

    const dropHandler = useCallback(async (e, getFiles) => {
        const files = await getFiles();
        return files.slice(0, fileCount);
    }, [fileCount]);

    return <Uploady debug
                    multiple={multiple}
                    destination={destination}
                    enhancer={enhancer}
                    grouped={grouped}
                    maxGroupSize={groupSize}>

        <StyledDropZone id="upload-drop-zone" onDragOverClassName="drag-over" dropHandler={dropHandler}>
            <div id="drag-text">Drag File(s) Here</div>
            <div id="drop-text">Drop Files(s) Here</div>
        </StyledDropZone>
    </Uploady>;
};

const DifferentWrapper = styled.div`
  display: flex;
  justify-content: space-around;
`;

export const DifferentConfiguration = (): Node => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    const destinationOverride = useMemo(() => ({
        ...destination,
        headers: { ...destination.headers, "x-test": "1234" }
    }), [destination]);

    return <Uploady debug
                    multiple={multiple}
                    destination={destination}
                    enhancer={enhancer}
                    grouped={grouped}
                    maxGroupSize={groupSize}>

        <p>
            DropZones can use different configuration overrides.
            However, Some options cannot be overriden.<br/>
            For example, any prop that influence the file input directly (such as multiple)
        </p>

        <DifferentWrapper>
            <SmallDropZone id="upload-dz-a" onDragOverClassName="drag-over" autoUpload={false}>
                <h2>autoUpload = false</h2>
                <div id="drag-text">Drag File(s) Here</div>
                <div id="drop-text">Drop Files(s) Here</div>
            </SmallDropZone>

            <SmallDropZone id="upload-dz-b" onDragOverClassName="drag-over" destination={destinationOverride}>
                <h2>add 'x-test' header</h2>
                <div id="drag-text">Drag File(s) Here</div>
                <div id="drop-text">Drop Files(s) Here</div>
            </SmallDropZone>
        </DifferentWrapper>

        <StoryUploadProgress/>
    </Uploady>;
};

const ThirdPartyDropZone = styled.div`
  ${dropZoneCss}
`;

const ThirdPartyDropZoneContainer = () => {
    const uploadyContext = useContext(UploadyContext);

    const [{ isDragging }, dropRef] = useDrop({
        accept: NativeTypes.FILE,
        collect: (monitor => ({
            isDragging: !!monitor.isOver()
        })),
        drop: (item, monitor) => {
            if (uploadyContext) {
                uploadyContext.upload(item.files);
            }
        },
    });

    return <ThirdPartyDropZone ref={dropRef} className={isDragging ? "drag-over" : ""}>
        <h2>Using React DnD</h2>
        <div id="drag-text">Drag File(s) Here</div>
        <div id="drop-text">Drop Files(s) Here</div>
    </ThirdPartyDropZone>;
};

export const WithThirdPartyDropZone = (): Node => {
	const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

	return <DndProvider backend={Backend}>
		<Uploady debug
				 multiple={multiple}
				 destination={destination}
				 enhancer={enhancer}
				 grouped={grouped}
				 maxGroupSize={groupSize}>

			<ThirdPartyDropZoneContainer/>
		</Uploady>
	</DndProvider>;
};

const MyClickableDropZone = forwardRef((props, ref) => {
	const { onClick, ...buttonProps } = props;

	const onZoneClick = useCallback((e) => {
		if (onClick) {
			onClick(e);
		}
	}, [onClick]);

	return <StyledDropZone {...buttonProps}
							ref={ref}
						   onDragOverClassName="drag-over"
						   extraProps={{ onClick: onZoneClick }}>
		<div id="drag-text">Drag File(s) Here</div>
		<div id="drop-text">Drop File(s) Here</div>
	</StyledDropZone>
});

const DropZoneButton = asUploadButton(MyClickableDropZone);

export const WithAsUploadButton = (): Node => {
	const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

	return <Uploady debug
					multiple={multiple}
					destination={destination}
					enhancer={enhancer}
					grouped={grouped}
					maxGroupSize={groupSize}>

		<p>Drop zone and upload button in a single component!</p>

		<DropZoneButton/>
	</Uploady>
};

const StyledFullScreenDropZone = styled(UploadDropZone)`
    width: 100%;
    height: 100vh;

   .content {
       width: 100%;
       height: 100vh;
       display: flex;
       align-items: center;
       justify-content: center;
   }

    &.drag-over .dropIndicator {
        position: absolute;
        z-index: 2;
        background: rgba(0, 0, 0, 0.5);
        border: 8px solid green;
        inset: 0;
    }
`;

export const WithFullScreen = (): Node => {
    const { enhancer, destination, multiple, grouped, groupSize, extOptions } = useStoryUploadySetup();
    const indicatorRef = useRef(null);

    return <Uploady debug
                    multiple={multiple}
                    destination={destination}
                    enhancer={enhancer}
                    grouped={grouped}
                    maxGroupSize={groupSize}
                    {...extOptions}
    >
        <StyledFullScreenDropZone
            id="upload-drop-zone"
            onDragOverClassName="drag-over"
            shouldRemoveDragOver={({ target }) => target === indicatorRef.current}
            shouldHandleDrag={(e) => {
                //$FlowExpectedError[method-unbinding]
                const allFiles = Array.prototype.slice.call(e.dataTransfer.items)
                    .every((item) => item.kind === "file");
                console.log("----- shouldHandleDrag -> All Files", allFiles, e);
                return allFiles;
            }}
        >
            <div className="content">
                <h1>Drop files here</h1>
            </div>
            <div className="dropIndicator" aria-hidden ref={indicatorRef} />
        </StyledFullScreenDropZone>
    </Uploady>;
};

export const WithDndTurnedOff = (): Node => {
    const { enhancer, destination, extOptions } = useStoryUploadySetup();
    return <Uploady debug
                    destination={destination}
                    enhancer={enhancer}
                    {...extOptions}
    >
        <StyledDropZone
            id="upload-drop-zone"
            onDragOverClassName="drag-over"
            shouldHandleDrag={false}
        >
            <div id="drag-text">Drag File(s) Here</div>
            <div id="drop-text">Drop File(s) Here</div>
        </StyledDropZone>
    </Uploady>;
};


export default (getCsfExport(UploadDropZone, "Upload Drop Zone", readme, { pkg: "upload-drop-zone", section: "UI" }): CsfExport);
