// @flow
import type { QueueState } from "./types";
import type { BatchItem } from "@rpldy/shared";
import type { CreateOptions } from "../types";
import { getMerge, isSamePropInArrays, logger, triggerUpdater } from "@rpldy/shared";

export type ItemsSendData = {
    items: BatchItem[],
    options: CreateOptions,
    cancelled?: boolean,
};

type ItemsRetriever<T> = (subject: T) => BatchItem[];
type SubjectRetriever<T> = (subject: T, CreateOptions) => Object;
type ItemsPreparer<T> = (queue: QueueState, subject: T) => Promise<ItemsSendData>;
type ResponseValidator = (updated: any) => void;

const mergeWithUndefined = getMerge({ undefinedOverwrites: true });

const processPrepareResponse = (eventType, items, options, updated) => {
    if (updated) {
        logger.debugLog(`uploader.queue: REQUEST_PRE_SEND(${eventType}) event returned updated items/options`, updated);
        if (updated.items) {
            //can't change items count at this point.
            if (updated.items.length !== items.length ||
                !isSamePropInArrays(updated.items, items, ["id", "batchId", "recycled"])) {
                throw new Error(`REQUEST_PRE_SEND(${eventType}) event handlers must return same items with same ids`);
            }

            items = updated.items;
        }

        if (updated.options) {
            options = mergeWithUndefined({}, options, updated.options);
        }
    }

    return { items, options, cancelled: (updated === false) };
};

const triggerItemsPrepareEvent =
    (queue: QueueState, eventSubject, items: BatchItem[], options: CreateOptions, eventType: string, validateResponse: ResponseValidator): Promise<ItemsSendData> =>
        triggerUpdater<{ subject: Object, options: CreateOptions }>(
            queue.trigger, eventType, eventSubject, options)
            // $FlowIssue - https://github.com/facebook/flow/issues/8215
            .then((updated: ?{ items: BatchItem[], options: CreateOptions }) => {
                validateResponse(updated);
                return processPrepareResponse(eventType, items, options, updated);
            });

const persistPrepareResponse = (queue, prepared) => {
    //update potentially changed data back into queue state
    queue.updateState((state) => {
        prepared.items.forEach((i) => {
            state.items[i.id] = i;
        });

        state.batches[prepared.items[0].batchId].batchOptions = prepared.options;
    });

    //use objects from internal state(proxies) - not objects from user-land!
    const updatedState = queue.getState();
    prepared.items = prepared.items.map((item) => updatedState.items[item.id]);
    prepared.options = updatedState.batches[prepared.items[0].batchId].batchOptions;
};


const prepareItems = <T>(
    queue: QueueState,
    subject: T,
    retrieveItemsFromSubject: ItemsRetriever<T>,
    createEventSubject: ?SubjectRetriever<T>,
    validateResponse: ?ResponseValidator,
    eventType: string
): Promise<ItemsSendData> => {
    const items = retrieveItemsFromSubject(subject);
    const batchOptions = queue.getState().batches[items[0].batchId].batchOptions;
    const eventSubject: Object = createEventSubject?.(subject, batchOptions) || subject;

    return triggerItemsPrepareEvent(queue, eventSubject, items, batchOptions, eventType, validateResponse)
        .then((prepared: ItemsSendData) => {
            if (!prepared.cancelled) {
                persistPrepareResponse(queue, prepared);
            }

            return prepared;
        });
};

const getItemsPrepareUpdater =
    <T>(
        eventType: string,
        retrieveItemsFromSubject: ItemsRetriever<T>,
        createEventSubject: ?SubjectRetriever<T> = null,
        validateResponse: ?ResponseValidator = null
    ): ItemsPreparer<T> =>
        (queue: QueueState, subject: T) =>
            prepareItems<T>(
                queue,
                subject,
                retrieveItemsFromSubject,
                createEventSubject,
                validateResponse,
                eventType
            );

export {
    getItemsPrepareUpdater,
};
