import React, { useCallback, useContext, useState } from "react";
import { BATCH_STATES, FILE_STATES } from "@rpldy/shared";
import {
    UploadyContext,
    useBatchAddListener,
    useBatchFinalizeListener,
    useAllAbortListener,
    useAbortAll,
    useAbortBatch,
    useAbortItem,
    useItemFinalizeListener,
} from "@rpldy/shared-ui";

const ListItem = ({ id, file, state, index }) => {
    const abortItem = useAbortItem();

    return (
        <li key={id}>
            {state === FILE_STATES.ABORTED &&
                <span style={{ color: "orangered" }}>[ABORTED]: {file.name} ({id})</span>}
            {state === FILE_STATES.FINISHED &&
                <span style={{ color: "green" }}>[FINISHED]: {file.name} ({id})</span>}

            {state !== FILE_STATES.ABORTED && state !== FILE_STATES.FINISHED &&
                <button data-test={`abort-file-${index}`}
                        onClick={() => abortItem(id)}>Abort: {file.name} ({id})</button>}
        </li>
    );
};

const BatchItem = ({ id, aborted, finished, index }) => {
    const abortBatch = useAbortBatch();

    return (<li key={id}>
        {aborted ?
            <span style={{ color: "orangered" }}>[ABORTED]: {id}</span> : (finished ?
                <span style={{ color: "green" }}>[FINISHED]: {id}</span> :
                <button data-test={`abort-batch-${index}`}
                        onClick={() => abortBatch(id)}>Abort batch: {id}</button>)}
    </li>);
};

const StoryAbortButton = () => {
    const context = useContext(UploadyContext);
    const [items, setItems] = useState([]);
    const [batches, setBatches] = useState([]);
    const abortAll = useAbortAll();

    useBatchAddListener((batch) => {
        setItems((prevItems) => [...prevItems, ...batch.items]);
        setBatches((prevBatches) => [...prevBatches, { id: batch.id, aborted: false, finished: false }]);
    });

    useBatchFinalizeListener((batch) => {
        const isAborted = batch.state === BATCH_STATES.ABORTED;

        if (isAborted) {
            console.log(">>>>> StoryAbortButton - (hook) BATCH ABORT - ", batch);
        }

        setBatches((prevBatches) =>
            prevBatches.map((b) => b.id === batch.id ? { ...b, aborted: isAborted, finished: true } : b));
    });

    useAllAbortListener(() => {
        console.log(">>>>> StoryAbortButton - (hook) ALL ABORT");
    });

    useItemFinalizeListener((item) => {
        setItems((prevItems) =>
            prevItems.map((i) => i.id === item.id ? item : i));
    });

    const onAbortAllClick = useCallback(() =>{
        abortAll();
    }, [context, abortAll]);

    const isUploadInProgress = batches.reduce((res, b) =>
        res || (!b.finished  && !b.aborted), false);

    return <div>
        {isUploadInProgress ? (<>
            <br/>
            <button onClick={onAbortAllClick} data-test="story-abort-all-button">Abort All</button>
        </>) : <h3>No Active Uploads</h3>}
        <br/>
        Batches:
        <ul>
            {batches.map((batch, i) =>
                <BatchItem {...batch} index={i} key={batch.id} />)}
        </ul>

        <br/>
            Files:
        <ul>
            {items.map((item, i) =>
                <ListItem {...item} index={i} key={item.id} />)}
        </ul>
    </div>;
};

export default StoryAbortButton;
