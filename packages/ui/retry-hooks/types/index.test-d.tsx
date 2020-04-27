import * as React from "react";
import { useRetry, useBatchRetry, useRetryListener } from "./index";

const TestRetryHooks: React.FC = () => {
    const retry = useRetry();
    const retryBatch = useBatchRetry();

    useRetryListener(({ items, options }) => {
        console.log(`retrying ${items.length} items`);
        console.log(options);
    });

    retry("item-1");
    retryBatch("b1");

    return <div/>;
};

const testRetryHooks = (): JSX.Element => {
    return <TestRetryHooks/>;
};

export {
    testRetryHooks,
};
