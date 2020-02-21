import React, { useCallback, useContext, useState } from "react";
import { UploadyContext, useBatchAbortListener, useBatchStartListener } from "@rpldy/shared-ui";

const AbortButton = () => {
    const context = useContext(UploadyContext);
    const [uploadingId, setUploading] = useState(null);

    useBatchStartListener((batch) => {
        setUploading(batch.id);
    });

    useBatchAbortListener((batch) => {
        console.log(">>>>> AbortButton - (hook) BATCH ABORT - ", batch);
    });

    const onClick = useCallback(() => {
        context.abortBatch(uploadingId);
    }, [context, uploadingId]);

    return context && uploadingId ?
        <button onClick={onClick}>Abort</button> : null;
};

export default AbortButton;
