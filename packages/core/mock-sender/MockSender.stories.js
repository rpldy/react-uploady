// @flow
import { useCallback, useEffect, useRef, useState, type Element } from "react";
import {
    getCsfExport,
    logToCypress,
    addActionLogEnhancer,
    type CsfExport,
} from "../../../story-helpers";
import createUploader, { UPLOADER_EVENTS, type UploadyUploaderType } from "@rpldy/uploader";
import { getMockSenderEnhancer } from "./src"

import readme from "./README.md";

const ProgressReport = ({ uploader }: { uploader: ?UploadyUploaderType}) => {
    const [completionPercentages, setCompletionPercentages] = useState<string[]>([]);
    const [itemProgress, setItemProgress] = useState<Record<string, string[]>>({});

    useEffect(() => {
        let offBatchProgress,
            offItemProgress;

        if (uploader) {
            offBatchProgress = uploader.on(UPLOADER_EVENTS.BATCH_PROGRESS, (batch) => {
                logToCypress("BATCH_PROGRESS", batch);
                setCompletionPercentages((prev) => [ ...prev, `${batch.loaded} | ${batch.completed}` ]);
            });

            offItemProgress = uploader.on(UPLOADER_EVENTS.ITEM_PROGRESS, (item, options) => {
                logToCypress("ITEM_PROGRESS", item, options);
                setItemProgress((prev) => ({
                    ...prev,
                    [item.id]: [ ...prev[item.id] ?? [], `${item.loaded} | ${item.completed}` ],
                }));
            });
        }

        return () => {
            if (uploader) {
                console.log("UNREGISTERING uploader event listeners")
                offBatchProgress();
                offItemProgress();
            }
        };
    }, [uploader]);

    return ( completionPercentages.length ?
        <table style={{ marginTop: "24px" }}>
            <thead>
            <tr>
                <th>Batch Progress</th>
                <th>Item Progress</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td>
                    <ul>
                        {completionPercentages.map((perc, index) => (
                            <li key={index}>{perc}</li>
                        ))}
                    </ul>
                </td>
                <td>
                    <ul>
                        {Object.values(itemProgress)
                            .map((percentages, index) =>
                                percentages.map((perc: string) => <li key={perc}>{perc}</li>)
                            )}
                    </ul>
                </td>
            </tr>
            </tbody>
        </table> : null
    );
}

const mockSenderEnhancer = getMockSenderEnhancer({
    delay: 1000,
    progressIntervals: [10, 20, 30, 40, 50, 60, 70, 80, 90]
});

export const WithMockProgress = (): Element<"div"> => {
    const uploaderRef = useRef<?UploadyUploaderType>(null)
    const [hasUploader, setHasUploader] = useState(false);

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
            <input type="file" ref={inputRef} style={{ display: "none" }} onChange={onInputChange}/>
            <button id="upload-button" onClick={onClick}>Upload</button>
            <ProgressReport uploader={uploaderRef.current}/>
        </div>
    );
};

const mockSenderStories: CsfExport = getCsfExport(undefined, "Mock Sender", readme, {
    pkg: "mock-sender",
    section: "Core"
});

export default { ...mockSenderStories, title: "Core/Mock Sender" };
