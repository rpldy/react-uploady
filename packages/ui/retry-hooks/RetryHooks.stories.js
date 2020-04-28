// @flow
import React, { useCallback, useState } from "react";
import { useItemStartListener } from "@rpldy/shared-ui";
import UploadButton from "@rpldy/upload-button";
import { composeEnhancers } from "@rpldy/uploader";
import Uploady from "@rpldy/uploady";
import { StoryUploadProgress, useStoryUploadySetup } from "../../../story-helpers";
import retryEnhancer, { useBatchRetry, useRetry, useRetryListener } from "./src";
import { withKnobs } from "@storybook/addon-knobs";

// $FlowFixMe - doesnt understand loading readme
import readme from "./README.md";

const RetryUi = () => {
    const [seenItems, setItems] = useState({});
    const [seenBatches, setBatches] = useState([]);
    const retry = useRetry();
    const retryBatch = useBatchRetry();

    useItemStartListener((item) => {
        let ret;

        const itemIdentity : string = item.file ? item.file.name : item.url;

        if (!seenItems[itemIdentity]) {
            setItems((seen) => {
                return { ...seen, [itemIdentity]: item.id };
            });

            setBatches((batches) => {
                return !~batches.indexOf(item.batchId) ?
                    batches.concat(item.batchId) :
                    batches;
            });

            ret = false;
        }

        //cancel all items seen for the first time
        return ret;
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
        <UploadButton id="upload-button"/>
        <br/>
        <button id="retry-all" onClick={onRetryAll}>Retry All</button>

        <section>Failed Batches:
            <ul>
                {seenBatches.map((bId, index) =>
                    <li style={{ cursor: "pointer" }}
                        key={bId}
                        data-id={bId}
                        data-test={`batch-retry-${index}`}
                        onClick={onRetryBatch}>
                        {bId}
                    </li>)}
            </ul>
        </section>

        <section>Failed Items:
            <ul>
                {Object.keys(seenItems).map((name, index) =>
                    <li style={{ cursor: "pointer" }}
                        data-id={seenItems[name]} key={seenItems[name]}
                        data-test={`item-retry-${index}`}
                        onClick={onRetryItem}>
                        cancelled: ({seenItems[name]}) {name}
                    </li>)}
            </ul>
        </section>
        <br/>
        <StoryUploadProgress/>
    </>
};

export const WithRetry = () => {
    const storySetup = useStoryUploadySetup();
    const { destination, multiple, grouped, groupSize } = storySetup;
    let { enhancer } = storySetup;

    enhancer = enhancer ?
        composeEnhancers(retryEnhancer, enhancer) : retryEnhancer;

    return <Uploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}
        grouped={grouped}
        maxGroupSize={groupSize}>

        <RetryUi />
    </Uploady>
};

export default {
    title: "Retry Hooks",
    decorators: [withKnobs],
    parameters: {
        sidebar: readme,
        options: {
            showPanel: true,
            //needed until storybook-readme fixes their bug - https://github.com/tuchk4/storybook-readme/issues/221
            theme: {}
        },
    },
};
