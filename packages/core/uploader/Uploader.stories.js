// @flow
import React, { useCallback, useState, useRef, useEffect, type Element } from "react";
import {
    UmdBundleScript,
    localDestination,
    UMD_NAMES,
    addActionLogEnhancer,
    useStoryUploadySetup,
    logToCypress,
    getCsfExport,
    type CsfExport
} from "../../../story-helpers";
import createUploader, { UPLOADER_EVENTS } from "./src";
import readme from "./README.md";
import type { UploadyUploaderType } from "./src";

export const WithCustomUI = (): Element<"div"> => {
    const { enhancer, destination, grouped, groupSize } = useStoryUploadySetup();
    const uploaderRef = useRef<?UploadyUploaderType>(null);
    const inputRef = useRef<?HTMLInputElement>(null);

    const onClick = useCallback(() => {
        const input = inputRef.current;
        if (input) {
            input.value = "";
            input.click();
        }
    }, []);

    const onInputChange = useCallback(() => {
        uploaderRef.current?.add(inputRef.current?.files);
    }, []);

    useEffect(() => {
        const uploader = createUploader({
            enhancer,
            destination,
            grouped,
            maxGroupSize: groupSize
        });

        uploaderRef.current = uploader;
    }, [enhancer, destination, grouped, groupSize]);

    return <div>
        <p>Uses the uploader as is, without the rpldy React wrappers</p>
        <input type="file" ref={inputRef} style={{ display: "none" }} onChange={onInputChange}/>
        <button id="upload-button" onClick={onClick}>Upload</button>
    </div>;
};

export const TEST_EventsData = (): Element<"div"> => {
    const { enhancer, destination, grouped, groupSize } = useStoryUploadySetup();
    const uploaderRef = useRef<?UploadyUploaderType>(null);
    const inputRef = useRef<?HTMLInputElement>(null);

    const onClick = useCallback(() => {
        const input = inputRef.current;
        if (input) {
            input.click();
        }
    }, []);

    const onInputChange = useCallback(() => {
        uploaderRef.current?.add(inputRef.current?.files, { userData: { test: "!23" } });
    }, []);

    useEffect(() => {
        const uploader = createUploader({
            enhancer,
            destination,
            grouped,
            maxGroupSize: groupSize
        });

        uploader.on(UPLOADER_EVENTS.BATCH_ADD, (batch, batchOptions) => {
            logToCypress(`###${UPLOADER_EVENTS.BATCH_ADD}`, batch, batchOptions);

            batch._test = "TEST!";
            batch.items[0]._test = "TEST!";
            batchOptions._test =  "TEST!";
        });

        uploader.on(UPLOADER_EVENTS.REQUEST_PRE_SEND, ({items, options}) => {
            logToCypress(`###${UPLOADER_EVENTS.REQUEST_PRE_SEND}`, items, options);
        });

        uploader.on(UPLOADER_EVENTS.ITEM_START, (item, options) => {
            logToCypress(`###${UPLOADER_EVENTS.ITEM_START}`, item, options);
        });

        uploader.on(UPLOADER_EVENTS.ITEM_PROGRESS, (item, options) => {
            logToCypress(`###${UPLOADER_EVENTS.ITEM_PROGRESS}`, item, options);
            item._test = "TEST!";
        });

        uploader.on(UPLOADER_EVENTS.ITEM_FINISH, (item, options) => {
            logToCypress(`###${UPLOADER_EVENTS.ITEM_FINISH}`, item, options);
        });

        uploader.on(UPLOADER_EVENTS.BATCH_FINISH, (batch, options) => {
            logToCypress(`###${UPLOADER_EVENTS.BATCH_FINISH}`, batch, options);
        });

        uploaderRef.current = uploader;
    }, [enhancer, destination, grouped, groupSize]);

    return <div>
        <p>Uses the uploader as is, without the rpldy React wrappers</p>
        <input type="file" ref={inputRef} style={{ display: "none" }} onChange={onInputChange}/>
        <button id="upload-button" onClick={onClick}>Upload</button>
    </div>;
};

export const UMD_Core = (): Element<"div"> => {
    const [uploaderReady, setUploaderReady] = useState(false);
    const inputRef = useRef<?HTMLInputElement>(null);
    const uploaderRef = useRef<?UploadyUploaderType>(null);

    const onBundleLoad = useCallback(() => {
        uploaderRef.current = window.rpldy.createUploader({
            destination: localDestination().destination,
            enhancer: addActionLogEnhancer(),
        });

        setUploaderReady(true);
    }, []);

    const onClick = useCallback(() => {
        const input = inputRef.current;
        if (input) {
            input.click();
        }
    }, []);

    const onInputChange = useCallback(() => {
        uploaderRef.current?.add(inputRef.current?.files);
    }, []);

    return <div>
        <UmdBundleScript bundle={UMD_NAMES.CORE} onLoad={onBundleLoad}/>

        <input type="file" ref={inputRef} style={{ display: "none" }}
               onChange={onInputChange}/>

        <h2>uploading to: {localDestination().destination.url}</h2>

        {uploaderReady && <button id="upload-button" onClick={onClick}>Upload</button>}
    </div>;
};

const uploaderStories: CsfExport = getCsfExport(undefined, "Uploader", readme, { pkg: "uploader", section: "Core" });

export default { ...uploaderStories, title: "Core/Uploader" };
