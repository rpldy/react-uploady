// @flow
import React, { useState, useMemo, type Node } from "react";
import createUploader, { UPLOADER_EVENTS } from "@rpldy/uploader";
import {
    useStoryUploadySetup,
    getCsfExport,
    logToCypress,
    type CsfExport,
} from "../../../story-helpers";
import getChunkedEnhancer, { CHUNK_EVENTS } from "./src";

// $FlowFixMe - doesnt understand loading readme
import readme from "./README.md";

const CHUNK_SIZE = 10 * 1024 * 1024; //10MB

export const WithChunkedSender = (): Node => {
    const { destination } = useStoryUploadySetup();
    const { url } = destination;
    const [file, setFile] = useState(null);

    const uploader = useMemo(() => {
        const chunkedEnhancer = getChunkedEnhancer({
            chunkSize: CHUNK_SIZE,
        });

        const uploader = createUploader({
            autoUpload: false,
            grouped: false,
            destination, //: { url: "http://localhost:3001" },
            params: { name: "field"},
            enhancer: chunkedEnhancer,
        });

        uploader.on(UPLOADER_EVENTS.ITEM_START, (item) => {
            console.log(`item ${item.file.name} started uploading`);
            logToCypress(`###${UPLOADER_EVENTS.ITEM_START}`, item);
        });

        uploader.on(UPLOADER_EVENTS.ITEM_PROGRESS, (item) => {
            console.log(`item ${item.file.name} Item Progress ${item.completed}% uploaded`);
            logToCypress(`###${UPLOADER_EVENTS.ITEM_PROGRESS}`, item);
        });

        uploader.on(UPLOADER_EVENTS.ITEM_FINISH, (item) => {
            console.log(`item ${item.id} Item Finish uploading`);
            logToCypress(`###${UPLOADER_EVENTS.ITEM_FINISH}`, item);
        });

        uploader.on(UPLOADER_EVENTS.ITEM_FINALIZE, (item) => {
            console.log(`item ${item.id} Item Final uploading`);
            logToCypress(`###${UPLOADER_EVENTS.ITEM_FINALIZE}`, item);
        });

        uploader.on(CHUNK_EVENTS.CHUNK_START, (data) => {
            const { chunk, totalCount } = data;
            console.log(`${chunk.index + 1} Chunk Start of ${totalCount}`);
            logToCypress(`###${CHUNK_EVENTS.CHUNK_START}`, data);
        });

        uploader.on(CHUNK_EVENTS.CHUNK_FINISH, (data) => {
            const { item } = data;
            console.log(`CHUNK_EVENTS.CHUNK_FINISH -> item.loaded ${item.loaded}`);
            logToCypress(`###${CHUNK_EVENTS.CHUNK_FINISH}`, data);
        });

        console.log("!!!!!!!!!! CREATED UPLOADER ", { destination, uploader });

        return uploader;
    }, [url]);

    const onSubmit = () => {
        console.log("submitting -------------- ", { file } );

        uploader.add([file], {params: { name: "textures" }});
        // uploader.add(fileName2, {params: { name: "asset" }});
        uploader.upload();
    };

    const onFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    return (
        <form>
            <input onChange={onFileChange} id="field-age" type="file" placeholder="browse File" />

            <button id="form-submit" type="button" onClick={onSubmit} disabled={!file || undefined} >
                Submit Form
            </button>
        </form>
    );
};

export default (getCsfExport(undefined, "ChunkedSender", readme): CsfExport);
