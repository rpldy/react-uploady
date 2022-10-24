import { BatchItem } from "@rpldy/shared";
import * as React from "react";
import {
    useRetry,
    useBatchRetry,
    useRetryListener,
    RetryBatchMethod,
    RetryMethod
} from "./index";

const TestRetryHooks: React.FC = () => {
    const retry: RetryMethod = useRetry();
    const retryBatch: RetryBatchMethod = useBatchRetry();

    useRetryListener(({ items, options }) => {
        console.log(`retrying ${items.length} items`);
        items.forEach((item: BatchItem) => console.log("retrying item: " + item.id));
        console.log(options);
    });

    retry("item-1");
    retryBatch("b1", { destination: { url: "another.url" } });

    return <div/>;
};

const testRetryHooks = (): JSX.Element => {
    return <TestRetryHooks/>;
};

export {
    testRetryHooks,
};
