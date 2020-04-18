import { actions } from "@storybook/addon-actions";
import { UPLOADER_EVENTS } from "@rpldy/uploader";

const isCypress = !!window.parent.Cypress;

const logToCypress = (...args) => {
    if (isCypress) {
        const cypressResults = window.parent.__cypressResults;

        if (cypressResults) {
            cypressResults.storyLog.push({ args });
        } else {
            console.warn("found cypress but not __cypressResults !! E2E WILL FAIL !", ...args);
        }
    }
};

const actionLogEnhancer = (uploader) => {
    const events = actions("ITEM_START", "ITEM_FINISH", "BATCH_ABORT");

    uploader.on(UPLOADER_EVENTS.ITEM_START, (item) => {
        events.ITEM_START(item.id, item.file ? item.file.name : item.url);
        logToCypress("ITEM_START", item);
    });

    uploader.on(UPLOADER_EVENTS.ITEM_FINISH, (item) => {
        events.ITEM_FINISH(item.id, item.file ? item.file.name : item.url);
        logToCypress("ITEM_FINISH", item);
    });

    uploader.on(UPLOADER_EVENTS.BATCH_ABORT, (batch) => {
        events.BATCH_ABORT(batch.id, "aborted");
        logToCypress("BATCH_ABORT", batch);
    });
};

export {
    actionLogEnhancer,
    logToCypress,
};
