import React, { useCallback } from "react";
import TusUploady, { useClearResumableStore } from "./index";

const TestTusUploady: React.FC = () => {
    return <TusUploady
        debug
        destination={{ url: "my-tus-server.com" }}
        featureDetection
        parallel={2}
        sendDataOnCreate
    />;
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