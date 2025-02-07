// @flow
import React, {
    useCallback,
    useState,
    useRef,
    useEffect,
} from "react";
import {
    UmdBundleScript,
    UMD_NAMES,
    logToCypress,
    ProgressReportTable,
    getCsfExport,
    createUploadyStory,
    type CsfExport,
    type UploadyStory,
    type UploadyStoryParams,
} from "../../../story-helpers";
import createUploader, { UPLOADER_EVENTS } from "./src";

import Readme from "./Uploader.storydoc.mdx";
import type { UploadyUploaderType } from "./src";
import type { Node } from "react";

export const WithCustomUI: UploadyStory = createUploadyStory(
    ({ enhancer, destination, grouped, groupSize }): Node => {
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
            uploaderRef.current = createUploader({
                enhancer,
                destination,
                grouped,
                maxGroupSize: groupSize,
            });
        }, [enhancer, destination, grouped, groupSize]);

        return (
            <div>
                <p>Uses the uploader as is, without the rpldy React wrappers</p>
                <input
                    type="file"
                    ref={inputRef}
                    style={{ display: "none" }}
                    onChange={onInputChange}
                />
                <button id="upload-button" onClick={onClick}>
                    Upload
                </button>
            </div>
        );
    });

export const WithProgress: UploadyStory = createUploadyStory(
    ({ enhancer, destination }): Node => {
        const uploaderRef = useRef<?UploadyUploaderType>(null);
        const [uploaderId, setUploaderId] = useState<?string>(null);
        const { url } = destination;

        console.log("rendering progress story", { uploaderId });
        useEffect(() => {
            uploaderRef.current = createUploader({
                enhancer,
                destination: { url },
            });
            setUploaderId(uploaderRef.current.id);
        }, [url]);

        const inputRef = useRef<?HTMLInputElement>(null);

        const onClick = useCallback(() => {
            const input = inputRef.current;
            if (input) {
                input.value = "";
                input.click();
            }
        }, []);

        const onInputChange = useCallback(() => {
            if (inputRef.current?.files) {
                uploaderRef.current?.add(inputRef.current?.files);
            }
        }, []);

        return (
            <div>
                <input
                    type="file"
                    ref={inputRef}
                    style={{ display: "none" }}
                    onChange={onInputChange}
                />
                <button id="upload-button" onClick={onClick}>
                    Upload
                </button>
                <ProgressReportTable uploader={uploaderRef.current}/>
            </div>
        );
    });

type UploaderProps = {
    enhancer: ?Function,
    destination: { url: string },
    grouped: boolean,
    groupSize: number,
    extOptions: ?Object,
    options?: ?Object,
};

const UploaderWithEvents = ({ enhancer, destination, grouped, groupSize, extOptions, options = {}, } : UploaderProps): Node => {
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
            maxGroupSize: groupSize,
            ...options,
        });

        uploader.on(UPLOADER_EVENTS.BATCH_ADD, (batch, batchOptions) => {
            logToCypress(`###${UPLOADER_EVENTS.BATCH_ADD}`, batch, batchOptions);

            batch._test = "TEST!";
            batch.items[0]._test = "TEST!";
            batchOptions._test = "TEST!";
        });

        uploader.on(UPLOADER_EVENTS.REQUEST_PRE_SEND, ({ items, options }) => {
            logToCypress(`###${UPLOADER_EVENTS.REQUEST_PRE_SEND}`, items, options);

            return extOptions?.preSendCallback?.(items, options) ?? undefined;
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

    return (
        <div>
            <p>Uses the uploader as is, without the rpldy React wrappers</p>
            <input
                type="file"
                ref={inputRef}
                style={{ display: "none" }}
                onChange={onInputChange}
            />
            <button id="upload-button" onClick={onClick}>
                Upload
            </button>
        </div>
    );
};

export const TEST_EventsData: UploadyStory = createUploadyStory(
    ({ enhancer, destination, grouped, groupSize, extOptions }): Node => {
  return (
      <UploaderWithEvents
          enhancer={enhancer}
          destination={destination}
          grouped={grouped}
          groupSize={groupSize}
          extOptions={extOptions}
      />
    );
});

export const TEST_ProtoPollute: UploadyStory = createUploadyStory((): Node => {
    useEffect(() => {
        window._test_createUploader = createUploader;
    }, []);

   return (
       <div>
           <h2>Proto Pollution Test</h2>
           <p id="test-info">createUploader is available on window._test_createUploader</p>
       </div>
   )
});

export const UMD_Core: UploadyStory = createUploadyStory(
    ({
         destination,
         enhancer,
         multiple,
     }: UploadyStoryParams): Node => {
    const [uploaderReady, setUploaderReady] = useState(false);
    const inputRef = useRef<?HTMLInputElement>(null);
    const uploaderRef = useRef<?UploadyUploaderType>(null);

    const onBundleLoad = useCallback(() => {
        uploaderRef.current = window.rpldy.createUploader({
            destination,
            enhancer,
            multiple,
        });

        setUploaderReady(true);
    }, [destination, enhancer, multiple]);

    const onClick = useCallback(() => {
        const input = inputRef.current;
        if (input) {
            input.click();
        }
    }, []);

    const onInputChange = useCallback(() => {
        uploaderRef.current?.add(inputRef.current?.files);
    }, []);

    return (
        <div>
            <UmdBundleScript bundle={UMD_NAMES.CORE} onLoad={onBundleLoad}/>

            <input
                type="file"
                ref={inputRef}
                style={{ display: "none" }}
                onChange={onInputChange}
            />

            <h2>uploading to: {destination?.url}</h2>

            {uploaderReady && (
                <button id="upload-button" onClick={onClick}>
                    Upload
                </button>
            )}
        </div>
    );
});

const uploaderStories: CsfExport = getCsfExport(undefined, "Uploader", Readme, {
    pkg: "uploader",
    section: "Core",
});

export default { ...uploaderStories, title: "Core/Uploader" };
