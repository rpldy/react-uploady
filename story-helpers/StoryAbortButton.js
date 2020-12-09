import React, { useCallback, useContext, useState } from "react";
import { UploadyContext, useBatchAbortListener, useBatchStartListener, useAllAbortListener, useAbortAll } from "@rpldy/shared-ui";

const StoryAbortButton = () => {
    const context = useContext(UploadyContext);
    const [uploadingId, setUploading] = useState(null);
    const abortAll = useAbortAll();

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

    return context && uploadingId ?
        (<>
            <button onClick={onClick} data-test="story-abort-button">Abort</button>
            <br/>
            <button onClick={onAbortAllClick} data-test="story-abort-all-button">Abort All</button>
        </>) : null
};

export default StoryAbortButton;
