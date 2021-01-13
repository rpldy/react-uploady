import React, { useCallback, useContext, useState } from "react";
import {
    UploadyContext,
    useBatchAddListener,
    useBatchAbortListener,
    useAllAbortListener,
    useAbortAll,
    useAbortBatch,
    useAbortItem,
} from "@rpldy/shared-ui";

const StoryAbortButton = () => {
    const context = useContext(UploadyContext);
    const [files, setFiles] = useState([]);
    const [batches, setBatches] = useState([]);
    const abortAll = useAbortAll();
    const abortBatch = useAbortBatch();
    const abortItem = useAbortItem();

    useBatchAddListener((batch) => {
        setFiles((prevFiles) => [...prevFiles, ...batch.items]);
        setBatches((prevBatches) => [...prevBatches, batch.id]);
    });

    useBatchAbortListener((batch) => {
        console.log(">>>>> StoryAbortButton - (hook) BATCH ABORT - ", batch);
    });

    useAllAbortListener(() => {
        console.log(">>>>> StoryAbortButton - (hook) ALL ABORT");
    });

    const onAbortAllClick = useCallback(() =>{
        abortAll();
    }, [context, abortAll]);

    return <div>
        {batches.length ? (<>
            <button onClick={onAbortAllClick} data-test="story-abort-all-button">Abort All</button>
        </>) : null}
        <br/>
        Batches:
        <ul>
            {batches.map((bId, i) =>
                <li key={bId}>
                    <button data-test={`abort-batch-${i}`}
                            onClick={() => abortBatch(bId)}>Abort batch: {bId}</button>
                </li>)}
        </ul>

        <br/>
            Files:
        <ul>
            {files.map((f, i) =>
                <li key={f.id}>
                    <button data-test={`abort-file-${i}`}
                            onClick={() => abortItem(f.id)}>Abort file: {f.file.name}</button>
                </li>)}
        </ul>
    </div>
};

export default StoryAbortButton;
