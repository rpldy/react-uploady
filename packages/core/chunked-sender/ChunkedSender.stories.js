// @flow
import { cloneDeep } from "lodash";
import React, { useState, useMemo, type Node } from "react";
import createUploader, { UPLOADER_EVENTS } from "@rpldy/uploader";
import {
    DEFAULT_CHUNK_SIZE,
    getCsfExport,
    logToCypress,
    addActionLogEnhancer,
    createUploadyStory,
    type CsfExport,
    type UploadyStory,
} from "../../../story-helpers";
import getChunkedEnhancer, { CHUNK_EVENTS } from "./src";
import readme from "./README.md";

export const WithChunkedSender: UploadyStory = createUploadyStory(
    ({ destination, chunkSize }): Node => {
        const { url } = destination;
        const [file, setFile] = useState<?File>(null);

        const uploader = useMemo(() => {
            const chunkedEnhancer = getChunkedEnhancer({
                chunkSize: chunkSize || DEFAULT_CHUNK_SIZE,
            });

            const uploader = createUploader({
                autoUpload: false,
                grouped: false,
                destination,
                params: { name: "field" },
                enhancer: addActionLogEnhancer(chunkedEnhancer),
            });

            uploader.on(UPLOADER_EVENTS.ITEM_PROGRESS, (item) => {
                console.log(
                    `%%%%%%%%%%%%%%%%%% ${item.id} Progress: ${item.completed}% completed, ${item.loaded} uploaded`,
                );
            });

            uploader.on(CHUNK_EVENTS.CHUNK_START, (data) => {
                const { chunk, totalCount } = data;
                console.log(`${chunk.index + 1} Chunk Start of ${totalCount}`);
                logToCypress("CHUNK_START", data);
            });

            uploader.on(CHUNK_EVENTS.CHUNK_FINISH, (data) => {
                const { item } = data;
                console.log(
                    `CHUNK_EVENTS.CHUNK_FINISH -> ${item.completed}% completed, ${item.loaded} uploaded`,
                    data,
                );
                logToCypress("CHUNK_FINISH", cloneDeep(data));
            });

            return uploader;
        }, [url, chunkSize]);

        const onSubmit = async () => {
            await uploader.add([file], { params: { name: "textures" } });
            uploader.upload();
        };

        const onFileChange = (event: SyntheticInputEvent<HTMLInputElement>) => {
            setFile(event.currentTarget.files[0]);
        };

        return (
            <form>
                <input
                    onChange={onFileChange}
                    id="field-age"
                    type="file"
                    placeholder="browse File"
                />

                <button
                    id="form-submit"
                    type="button"
                    onClick={onSubmit}
                    disabled={!file || undefined}
                >
                    Submit Form
                </button>
            </form>
        );
    });

const chunkedSenderStories: CsfExport = getCsfExport(undefined, "Chunked Sender", readme, {
    pkg: "chunked-sender",
    section: "Core",
    parameters: {
        controls: {
            exclude: ["group"],
        }
    },
    args: {
        chunkSize: DEFAULT_CHUNK_SIZE,
    },
    argTypes: {
        chunkSize: { control: "number" }
    }
});

export default { ...chunkedSenderStories, title: "Core/Chunked Sender" };
