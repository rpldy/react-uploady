import React, { useCallback } from "react";
import type { TusResumeStartEventData } from "@rpldy/tus-sender";
import TusUploady, { useClearResumableStore, useTusResumeStartListener } from "./index";

const TusEventsHandler = () => {
    useTusResumeStartListener(({ url, item }: TusResumeStartEventData) => {
        console.log(`about to resume ${item.id} at url: ${url}`);

        return {
            resumeHeaders: {
                "x-auth": "123",
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
