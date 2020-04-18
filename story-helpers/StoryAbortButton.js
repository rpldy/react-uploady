import React, { useCallback, useContext, useState } from "react";
import { UploadyContext, useBatchAbortListener, useBatchStartListener } from "@rpldy/shared-ui";

const StoryAbortButton = () => {
    const context = useContext(UploadyContext);
    const [uploadingId, setUploading] = useState(null);

    useBatchStartListener((batch) => {
        setUploading(batch.id);
    });

    useBatchAbortListener((batch) => {
        console.log(">>>>> StoryAbortButton - (hook) BATCH ABORT - ", batch);
    });

    const onClick = useCallback(() => {
        context.abortBatch(uploadingId);
    }, [context, uploadingId]);

    return context && uploadingId ?
        <button onClick={onClick} data-test="story-abort-button">Abort</button> : null;
};

export default StoryAbortButton;
