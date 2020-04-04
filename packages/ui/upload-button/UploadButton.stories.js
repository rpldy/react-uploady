// @flow
import React, { Component, useMemo, useState, useRef, useCallback } from "react";
import styled from "styled-components";
import { withKnobs } from "@storybook/addon-knobs";
import Uploady, {
    useFileInput,
    UploadyContext,
    useItemStartListener,
    useItemFinishListener,
    useBatchStartListener,
    useBatchFinishListener,
    UPLOADER_EVENTS,
    composeEnhancers,
} from "@rpldy/uploady";
import retryEnhancer, { useRetry, useBatchRetry, useRetryListener } from "@rpldy/retry";
import {
    useStoryUploadySetup,
    StoryUploadProgress,
    StoryAbortButton,
    uploadButtonCss,
    localDestination,
} from "../../../story-helpers";
import UploadButton, { asUploadButton } from "./src";

// import readme from '../README.md';

export const Simple = () => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    return <Uploady debug
                    multiple={multiple}
                    destination={destination}
                    enhancer={enhancer}
                    grouped={grouped}
                    maxGroupSize={groupSize}>

        <UploadButton/>
    </Uploady>;
};

const StyledUploadButton = styled(UploadButton)`
  ${uploadButtonCss}
`;

export const WithStyledComponent = () => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    return <Uploady debug
                    multiple={multiple}
                    destination={destination}
                    enhancer={enhancer}
                    grouped={grouped}
                    maxGroupSize={groupSize}>

        <StyledUploadButton/>
    </Uploady>;
};

export const WithEventListeners = () => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    const listeners = useMemo(() => ({
        [UPLOADER_EVENTS.BATCH_START]: (batch) => {
            console.log(`>>>>> WithEventListeners - BATCH START - ${batch.id}`)
        },
        [UPLOADER_EVENTS.BATCH_FINISH]: (batch) => {
            console.log(`>>>>> WithEventListeners - BATCH FINISH - ${batch.id}`, batch)
        },
        [UPLOADER_EVENTS.ITEM_START]: (file) => {
            console.log(`>>>>> WithEventListeners - FILE START - ${file.id}`)
        },
        [UPLOADER_EVENTS.ITEM_FINISH]: (file) => {
            console.log(`>>>>> WithEventListeners - FILE FINISH - ${file.id}`, file)
        },
    }), []);

    return <Uploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}
        listeners={listeners}
        grouped={grouped}
        maxGroupSize={groupSize}>
        <UploadButton/>
    </Uploady>;
};

const HookedUploadButton = () => {
    useItemFinishListener((file) => {
        console.log(">>>>>> HookedUploadButton - FILE FINISH - ", file);
    });

    useBatchStartListener((batch) => {
        console.log(">>>>> HookedUploadButton - (hook) BATCH START - ", batch);

        const item = batch.items[0];

        if (item.file) {
            console.log(item.file);
        }
    });

    return <UploadButton/>;
};

export const withEventHooks = () => {
    const { enhancer, destination, multiple } = useStoryUploadySetup();

    return <Uploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}>
        <HookedUploadButton/>
    </Uploady>;
};

export const WithProgress = () => {
    const { enhancer, destination, multiple } = useStoryUploadySetup();

    return <Uploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}>
        <StoryUploadProgress/>
        <UploadButton/>
    </Uploady>;
};

class ClassUsingCustomButton extends Component<any> {

    unsubscribeBatchStart = null;

    componentDidMount(): * {
        this.unsubscribeBatchStart = this.context.on(UPLOADER_EVENTS.BATCH_START, (batch) => {
            console.log(`>>>>> ClassUsingCustomButton - BATCH START - ${batch.id}`);
        });
    }

    componentWillUnmount(): * {
        if (this.unsubscribeBatchStart) {
            this.unsubscribeBatchStart();
        }
    }

    static contextType = UploadyContext;

    showFileChooser = () => {
        this.context.showFileUpload();
    };

    render() {
        return (
            <button onClick={this.showFileChooser}>Custom Upload Button</button>
        );
    }
}

export const WithClass = () => {
    const { enhancer, destination, multiple } = useStoryUploadySetup();
    return <Uploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}>
        <ClassUsingCustomButton/>
    </Uploady>;
};

export const Abort = () => {
    const { enhancer, destination, multiple } = useStoryUploadySetup();

    return <div>
        <p>Enable the "local destination" with "long local request" knobs to be able to try aborting
            a running request</p>
        <Uploady
            debug
            multiple={multiple}
            destination={destination}
            enhancer={enhancer}>

            <UploadButton/>
            <StoryAbortButton/>
        </Uploady>
    </div>
};

const DisabledDuringUploadButton = () => {
    const [uploading, setUploading] = useState(false);

    useBatchStartListener(() => {
        setUploading(true);
    });

    useBatchFinishListener(() => {
        setUploading(false);
    });

    return <StyledUploadButton extraProps={{ disabled: uploading }}/>;
};

export const DisabledDuringUpload = () => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    return <Uploady
        debug
        multiple={multiple}
        destination={destination}
        enhancer={enhancer}
        grouped={grouped}
        maxGroupSize={groupSize}>

        <DisabledDuringUploadButton/>
    </Uploady>;
};

export const DifferentConfiguration = () => {
    const { enhancer, destination, multiple } = useStoryUploadySetup();

    const destinationOverride = useMemo(() => ({
        ...destination,
        headers: { ...destination.headers, "x-test": "1234" }
    }), [destination]);

    return <div>
        <p>Buttons can use different configuration overrides.<br/>
            However, Some options cannot be overriden by the button.<br/>
            For example, any prop that influence the file input directly (such as multiple)
        </p>
        <Uploady
            debug
            multiple={multiple}
            destination={destination}
            enhancer={enhancer}>

            <UploadButton autoUpload={false}>
                autoUpload = false
            </UploadButton>
            <br/>
            <UploadButton destination={destinationOverride}>
                add 'x-test' header
            </UploadButton>
        </Uploady>
    </div>
};

const DivUploadButton = asUploadButton((props) => {
    return <div {...props} style={{ border: "1px solid red", width: "200px", cursor: "pointer" }}>
        This is a DIV
    </div>
});

export const WithCustomComponentAsButton = () => {
    const { enhancer, destination, multiple, grouped, groupSize } = useStoryUploadySetup();

    return <Uploady debug
                    multiple={multiple}
                    destination={destination}
                    enhancer={enhancer}
                    grouped={grouped}
                    maxGroupSize={groupSize}>

        <DivUploadButton/>
    </Uploady>;
};

const ExampleForm = ({ url }) => {
    const inputRef = useRef();
    useFileInput(inputRef);

    return <form action={url} method="POST">
        <input type="file" name="testFile" style={{ display: "none" }} ref={inputRef}/>
    </form>;
};

export const WithCustomFileInputAndForm = () => {
    return <section>
        <Uploady
            debug
            customInput
        >
            <ExampleForm url={localDestination().url}/>
            <UploadButton/>
        </Uploady>
    </section>
};

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
        <UploadButton/>
        <br/>
        <button onClick={onRetryAll}>Retry All</button>

        <section>Failed Batches:
            <ul>
                {seenBatches.map((bId) =>
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
                {Object.keys(seenItems).map((name) =>
                    <li style={{ cursor: "pointer" }}
                        data-id={seenItems[name]} key={seenItems[name]}
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
    component: UploadButton,
    title: "Upload Button",
    decorators: [withKnobs],
};
