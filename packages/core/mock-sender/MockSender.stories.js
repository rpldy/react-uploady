// @flow
import { useCallback, useEffect, useRef, useState } from "react";
import {
    getCsfExport,
    addActionLogEnhancer,
    ProgressReportTable,
    type CsfExport,
} from "../../../story-helpers";
import createUploader, { type UploadyUploaderType } from "@rpldy/uploader";
import { getMockSenderEnhancer } from "./src";

import readme from "./README.md";
import type { Node } from "react";

const mockSenderEnhancer = getMockSenderEnhancer({
    delay: 1000,
    progressIntervals: [10, 20, 30, 40, 50, 60, 70, 80, 90],
});

export const WithMockProgress = (): Node => {
    const uploaderRef = useRef<?UploadyUploaderType>(null);
    const [_, setHasUploader] = useState(false);

    useEffect(() => {
        uploaderRef.current = createUploader({
            enhancer: addActionLogEnhancer(mockSenderEnhancer),
        });
        setHasUploader(true);
    }, []);

    const inputRef = useRef<?HTMLInputElement>(null);

    const onClick = useCallback(() => {
        const input = inputRef.current;
        if (input) {
            input.value = "";
            input.click();
        }
    }, []);

    const onInputChange = useCallback(() => {
        if (inputRef.current?.files) {
            uploaderRef.current?.add(inputRef.current?.files);
        }
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
            <ProgressReportTable uploader={uploaderRef.current}/>
        </div>
    );
};

const mockSenderStories: CsfExport = getCsfExport(undefined, "Mock Sender", readme, {
    pkg: "mock-sender",
    section: "Core",
    parameters: {
        controls: { disable: true }
    }
});

export default { ...mockSenderStories, title: "Core/Mock Sender" };
