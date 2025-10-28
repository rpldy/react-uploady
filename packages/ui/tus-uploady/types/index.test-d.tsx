import React, { useCallback } from "react";
import type { TusResumeStartEventData } from "@rpldy/tus-sender";
import TusUploady, { useClearResumableStore, useTusResumeStartListener, useTusPartStartListener } from "./index";

const TusEventsHandler = () => {
    useTusResumeStartListener(({ url, item }: TusResumeStartEventData) => {
        console.log(`about to resume ${item.id} at url: ${url}`);

        return {
            resumeHeaders: {
                "x-auth": "123",
            }
        };
    });

    useTusPartStartListener(({ url, item, chunk, headers }) => {
        console.log(`about to start part ${item.id}-${chunk.index} at url: ${url}`);

        return {
            url: url + `?part=${chunk.index + 1}`,
            headers: {
                "authorization": headers["authorization"] + chunk.id,
                "x-part": `${chunk.index + 1}`,
            }
        };
    });

    return null;
};

const TestTusUploady: React.FC = () => {
    return <TusUploady
        debug
        destination={{ url: "my-tus-server.com" }}
        featureDetection
        parallel={2}
        sendDataOnCreate
    >
        <TusEventsHandler/>
    </TusUploady>;
};

const TestClearResumableStore: React.FC = () => {
    const clearResumables = useClearResumableStore();

    const onClear = useCallback(() => {
        clearResumables();
    }, [clearResumables]);

    return <button onClick={onClear}>Clear Store</button>;
};

export {
    TestTusUploady,
    TestClearResumableStore
};
