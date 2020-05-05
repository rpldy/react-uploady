# Retry Failed Uploads

[@rpldy/retry](../packages/retry) and its React counter part: [@rpldy/retry-hooks](../packages/ui/retry-hooks)
provide retry functionality for failed uploads. 

There are 3 retry flavors: retry all, retry batch, and retry item.

These packages don't provide an UI components but rather the functionality to enable retry and the hooks that 
make it easy to wire-up your UI.  

## Example

The following code shows how to add UI elements that can trigger a retry for all 3 flavors.

```javascript
import React, { useCallback, useState } from "react";
import Uploady from "@rpldy/uploady";
import retryEnhancer, { useBatchRetry, useRetry, useRetryListener } from "@rpldy/retry-hooks";

const RetryUi = () => {
    const [failedItems, setFailedItems] = useState({});
    const [failedBatches, setFailedBatches] = useState([]);
    const retry = useRetry();
    const retryBatch = useBatchRetry();

    useItemErrorListener((item) => {
        const itemIdentity : string = item.file ? item.file.name : item.url;

        if (!failedItems[itemIdentity]) {
            setFailedItems((failed) => {
                return { ...failed, [itemIdentity]: item.id };
            });

            setFailedBatches((batches) => {
                return !~batches.indexOf(item.batchId) ?
                    batches.concat(item.batchId) :
                    batches;
            });
        }
    });

    useRetryListener(({ items }) => {
        console.log("##### RETRY EVENT - retrying items: ", items);
    });

    const onRetryAll = useCallback(() => {
        retry();
    }, [retry]);

    const onRetryItem = useCallback((e) => {
        const itemId = e.target.dataset["id"];
        retry(itemId);
    }, [retry]);

    const onRetryBatch = useCallback((e) => {
        const batchId = e.target.dataset["id"];
        retryBatch(batchId);
    }, [retryBatch]);

    return <>
       
        <br/>
        <button id="retry-all" onClick={onRetryAll}>Retry All</button>

        <section>Failed Batches:
            <ul>
                {failedBatches.map((bId) =>
                    <li style={{ cursor: "pointer" }}
                        key={bId}
                        data-id={bId}
                        onClick={onRetryBatch}>
                        {bId}
                    </li>)}
            </ul>
        </section>

        <section>Failed Items:
            <ul>
                {Object.keys(failedItems).map((name) =>
                    <li style={{ cursor: "pointer" }}
                        key={failedItems[name]}
                        data-id={failedItems[name]}
                        onClick={onRetryItem}>
                        failed: ({failedItems[name]}) {name}
                    </li>)}
            </ul>
        </section>
        <br/>
    </>
};

export const MyApp = () => {
    return <Uploady
        destination={{url: "https://my-server.com/upload"}}
        enhancer={retryEnhancer}>

        <RetryUi />
    </Uploady>
};

```