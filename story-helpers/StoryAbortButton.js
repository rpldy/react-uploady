import React, { useCallback, useContext, useState } from "react";
import {
    UploadyContext,
    useBatchAddListener,
    useBatchAbortListener,
    useBatchStartListener,
    useAllAbortListener,
    useAbortAll,
    useAbortItem,
} from "@rpldy/shared-ui";

const StoryAbortButton = () => {
    const context = useContext(UploadyContext);
    const [uploadingId, setUploading] = useState(null);
    const [files, setFiles] = useState([]);
    const abortAll = useAbortAll();
    const abortItem = useAbortItem();

    useBatchAddListener((batch) => {
        setFiles((prevState) => [...prevState, ...batch.items]);
    });

    useBatchStartListener((batch) => {
        setUploading(batch.id);
    });

    useBatchAbortListener((batch) => {
        console.log(">>>>> StoryAbortButton - (hook) BATCH ABORT - ", batch);
    });

    useAllAbortListener(() => {
        console.log(">>>>> StoryAbortButton - (hook) ALL ABORT");
    });

    const onClick = useCallback(() => {
        console.log("ABORTING BATCH ", uploadingId);
        context.abortBatch(uploadingId);
    }, [context, uploadingId]);

    const onAbortAllClick = useCallback(() =>{
        abortAll();
    }, [context, abortAll]);

    return <div>
        {context && uploadingId ? (<>
            <button onClick={onClick} data-test="story-abort-button">Abort Batch: {uploadingId}</button>
            <br/>
            <button onClick={onAbortAllClick} data-test="story-abort-all-button">Abort All</button>
            <br/>
        </>) : null}

        <ul>
            {files.map((f, i) =>
                <li key={f.id}>
                    <button data-test={`abort-pending-${i}`}
                            onClick={() => abortItem(f.id)}>Abort file: {f.file.name}</button>
                </li>)}
        </ul>
    </div>
};

export default StoryAbortButton;
