// @flow
import React, { useEffect, useState, type Node } from "react";
import { UPLOADER_EVENTS } from "../packages/core/uploader";
import { logToCypress, } from "./uploadyStoryLogger";
import type { UploadyUploaderType } from "../packages/core/uploader";

const ProgressReportTable = ({ uploader }: { uploader: ?UploadyUploaderType }): Node => {
    const [completionPercentages, setCompletionPercentages] = useState<string[]>([]);
    const [itemProgress, setItemProgress] = useState<Record<string, string[]>>({});

    useEffect(() => {
        let offBatchProgress,
            offItemProgress;

        if (uploader) {
            offBatchProgress = uploader.on(UPLOADER_EVENTS.BATCH_PROGRESS, (batch) => {
                logToCypress("BATCH_PROGRESS", { ...batch });
                setCompletionPercentages((prev) => [...prev, `${batch.loaded} | ${batch.completed}`]);
            });

            offItemProgress = uploader.on(UPLOADER_EVENTS.ITEM_PROGRESS, (item, options) => {
                logToCypress("ITEM_PROGRESS", { ...item }, options);
                setItemProgress((prev) => ({
                    ...prev,
                    [item.id]: [...prev[item.id] ?? [], `${item.loaded} | ${item.completed}`],
                }));
            });
        }

        return () => {
            if (uploader) {
                console.log("UNREGISTERING uploader event listeners");
                offBatchProgress();
                offItemProgress();
            }
        };
    }, [uploader]);

    return (
        <table style={{ marginTop: "24px" }}>
            <thead>
            <tr>
                <th>Batch Progress</th>
                <th>Item Progress</th>
            </tr>
            </thead>
            {
                completionPercentages.length ? <tbody>
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
                    : null
            }
        </table>
    );
};

export default ProgressReportTable;
