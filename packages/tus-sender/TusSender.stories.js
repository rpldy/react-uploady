// @flow
import React, { useCallback, useEffect, useRef, useState } from "react";
import { withKnobs, number } from "@storybook/addon-knobs";
import { logger } from "@rpldy/shared";
import createUploader, { composeEnhancers } from "@rpldy/uploader";
import { useStoryUploadySetup, DESTINATION_TYPES } from "../../story-helpers";
import getTusEnhancer from "./src";

import { Upload as Tus } from "tus-js-client";

// $FlowFixMe - doesnt understand loading readme
import readme from "./README.md";

logger.setDebug(true);

export const WithTusSender = () => {
    const inputRef = useRef(null);
    const uploaderRef = useRef(null);

    const { enhancer, destination, destinationType } = useStoryUploadySetup({
        noGroup: true,
        destinations: [DESTINATION_TYPES.url, DESTINATION_TYPES.local]
    });

    useEffect(() => {
        const tusEnhancer = getTusEnhancer();

        uploaderRef.current = createUploader({
            enhancer: enhancer ? composeEnhancers(enhancer, tusEnhancer) : tusEnhancer,
            destination,
        });
    }, [enhancer, destination, destinationType]);

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

    return <div>
        <p>Uses Uploader & TUS Sender</p>
        <input type="file" ref={inputRef} style={{ display: "none" }} onChange={onInputChange}/>
        <button id="upload-button" onClick={onClick}>Upload with TUS</button>
    </div>
};

export const WithTusJsClient  = () => {
    const inputRef = useRef(null);

    const onInputChange = useCallback(() => {

        const upload = new Tus(inputRef.current.files[0], {
            endpoint: "http://localhost:4000/upload",
            chunkSize: 5242880,

            onError: error => {
                console.log("Failed because: ", error);
            },

            onSuccess: () => {
                console.log("Success", upload);
            }
        });

        upload.start();

    }, []);

    return <div>
        <p>Uses TUS JS Client</p>
        <input type="file" ref={inputRef} onChange={onInputChange}/>
    </div>
};

export default {
    title: "TUS Sender",
    decorators: [withKnobs],
    parameters: {
        readme: {
            sidebar: readme,
        },
        options: {
            showPanel: true,
            //needed until storybook-readme fixes their bug - https://github.com/tuchk4/storybook-readme/issues/221
            theme: {}
        },
    },
};

